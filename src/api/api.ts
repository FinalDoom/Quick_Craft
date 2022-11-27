import {RateLimiter} from 'limiter';
import {ingredients} from '../generated/recipe_info';
import log, {Logger} from '../log/log';

const API_THROTTLE_WINDOW_MILLLIS = 10000;
const MAX_QUERIES_PER_WINDOW = 5;
const BACKOFF_TIME_MILLIS = 2000;

/**
 * Top-level structure of a success response from the API.
 */
export interface SuccessfulApiResponse<T> {
  status: 'success';
  response: T;
}
/**
 * Top-level structure of a failure response from the API.
 */
export interface FailureApiResponse {
  status: 'failure';
  error: string;
}
export type ApiResponse<T> = SuccessfulApiResponse<T> | FailureApiResponse;

const isSuccessResponse = <T>(response: ApiResponse<T>): response is SuccessfulApiResponse<T> =>
  response.status === 'success';
export const isFailureResponse = <T>(response: ApiResponse<T>): response is FailureApiResponse =>
  response.status === 'failure';

type ApiEquippedInfo = {
  slotid: string | number;
  equipid: string | number;
  itemid: string | number;
  breakTime: string | Date;
  buffID: string | number;
  id: string | number;
  experience: string | number;
  level: string | number;
};
type ApiEquippableInfo = {
  id: string | number;
  itemid: string | number;
  timeUntilBreak: 'Null' | string | number;
  equippedBefore: boolean;
  experience: string | number;
  level: string | number;
};
type ApiInventoryInfo = {
  itemid: string | number;
  equipid: string | number;
  amount: string | number;
};
/**
 * Normalized equipment info.
 */
export type EquipmentInfo = {
  /** Equipment's item ID. */
  itemId: number;
  /** Equipment's unique equipment ID. */
  id: number;
  /** Equipment's experience count or 0 for non-levelling equipment. */
  experience: number;
  /** Total seconds that this equipment can be worn before breaking. */
  equipLife?: number;
  /** True if this equipment is currently equipped. */
  equipped: boolean;
  /** Seconds remaining until this equipment breaks. */
  timeUntilBreak?: number;
};

export default interface Api {
  /**
   * Execute a call against an API endpoint with throttling.
   *
   * @param data url parameters to pass in the api call.
   */
  call(data: Record<string, string>): Promise<Response>;
  /**
   * Calls the API to unequip the equipment specified by `equipid`.
   * @param equipid ID of the equipment to unequip.
   */
  unequip(equipid: number): Promise<true>;
  /**
   * Calls the API to equip the equipment specified by `equipid`.
   * @param equipid ID of the equipment to equip.
   */
  equip(equipid: number): Promise<true>;
  /**
   * Calls the API to get inventory item counts, excluding equipment.
   * @returns Map from item ID to count in user's inventory.
   */
  getInventoryCounts(): Promise<Map<number, number>>;
  /**
   * Calls the API to get all currently equipped equip IDs.
   * @returns Array of all currently equipped equipment IDs.
   */
  getEquippedIds(): Promise<Array<number>>;
  /**
   * Calls the API to get detailed information on equipment.
   * @returns Map from item ID to array of {@link EquipmentInfo} about equipment with that ID.
   */
  getEquipmentInfo(): Promise<Map<number, Array<EquipmentInfo>>>;
}

export class GazelleApi implements Api {
  #key: string;
  #limiter: RateLimiter;
  #log: Logger;

  constructor(apiKey: string) {
    this.#key = apiKey;
    this.#log = log.getLogger('API');

    this.#limiter = new RateLimiter({
      tokensPerInterval: MAX_QUERIES_PER_WINDOW,
      interval: API_THROTTLE_WINDOW_MILLLIS,
    });
    this.#log.debug(
      'Built API with throttle %d queries per %d milliseconds.',
      MAX_QUERIES_PER_WINDOW,
      API_THROTTLE_WINDOW_MILLLIS,
    );
  }

  async #sleep(millisToSleep: number) {
    await new Promise((resolve) => setTimeout(resolve, millisToSleep));
  }

  async #fetchAndRetryIfNecessary(callFn: () => ReturnType<typeof this.call>): ReturnType<typeof this.call> {
    const response = await callFn();
    if (response.status === 429) {
      await this.#sleep(BACKOFF_TIME_MILLIS);
      return this.#fetchAndRetryIfNecessary(callFn);
    }
    return response;
  }

  async #acquireToken(fn: () => ReturnType<typeof this.call>): ReturnType<typeof this.call> {
    if (this.#limiter.tryRemoveTokens(1)) {
      return fn();
    } else {
      await this.#sleep(API_THROTTLE_WINDOW_MILLLIS);
      return this.#acquireToken(fn);
    }
  }

  async call(data: Record<string, string>): Promise<Response> {
    this.#log.debug('Call attempt', data);
    return this.#fetchAndRetryIfNecessary(() =>
      this.#acquireToken(() => {
        this.#log.debug('Call executing fetch', data);
        return fetch('/api.php?' + new URLSearchParams(data).toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-API-Key': this.#key,
          },
        });
      }),
    );
  }

  async unequip(equipid: number): Promise<true> {
    this.#log.debug('Unequipping equipment id', equipid);
    return await this.call({request: 'items', type: 'unequip', equipid: String(equipid)})
      .then((response) => response.json())
      .then((response: ApiResponse<string>) => {
        if (isFailureResponse(response)) {
          const fail = `Failed to unequip equip id ${equipid}: ${response.error}`;
          this.#log.error(fail);
          throw fail;
        }
        return true;
      });
  }

  async equip(equipid: number): Promise<true> {
    this.#log.debug('Equipping equipment id', equipid);
    return await this.call({request: 'items', type: 'equip', equipid: String(equipid)})
      .then((response) => response.json())
      .then((response: ApiResponse<string>) => {
        if (isFailureResponse(response)) {
          const fail = `Failed to re-equip equip id ${equipid}: ${response.error}`;
          this.#log.error(fail);
          throw fail;
        }
        return true;
      });
  }

  // Caller needs:
  // window.noty({type: 'error', text: 'Quick Crafting loading inventory failed. Please check logs and reload.'});
  async getInventoryCounts(): Promise<Map<number, number>> {
    this.#log.debug('Getting inventory counts');
    return await this.call({request: 'items', type: 'inventory'})
      .then((response) => response.json())
      .then((response: ApiResponse<Array<ApiInventoryInfo>>) => {
        if (isFailureResponse(response)) {
          const fail = 'Loading inventory failed';
          this.#log.error(fail);
          throw fail;
        }
        this.#log.debug('Got inventory', response.response);
        return new Map(
          response.response
            .filter(({equipid}) => !(equipid && Number(equipid)))
            .map(({itemid, amount}) => [Number(itemid), Number(amount)]),
        );
      });
  }

  async getEquippedIds(): Promise<Array<number>> {
    this.#log.debug('Getting equipment IDs');
    return await this.call({request: 'items', type: 'users_equipped'})
      .then((response) => response.json())
      .then((response: ApiResponse<Array<ApiEquippedInfo>>) => {
        if (isFailureResponse(response)) {
          const fail = 'Loading equipped IDs failed.';
          this.#log.error(fail);
          throw fail;
        }
        this.#log.debug('Got equipment IDs', response.response);
        return response.response.map(({equipid}) => Number(equipid));
      });
  }

  async getEquipmentInfo(): Promise<Map<number, Array<EquipmentInfo>>> {
    this.#log.debug('Getting equipment info');
    const equippedIds = (await this.getEquippedIds()) || [];
    return await this.call({request: 'items', type: 'users_equippable'})
      .then((response) => response.json())
      .then((response: ApiResponse<Array<ApiEquippableInfo>>) => {
        if (isFailureResponse(response)) {
          const fail = 'Loading equipment Info failed.';
          this.#log.error(fail);
          throw fail;
        }
        this.#log.debug('Got equipment info', response.response);
        return response.response
          .filter(({itemid}) => itemid in ingredients)
          .map(
            ({itemid, id, experience, timeUntilBreak}): EquipmentInfo => ({
              itemId: Number(itemid),
              id: Number(id),
              experience: Number(experience),
              equipLife: ingredients[Number(itemid)].equipLife,
              equipped: equippedIds.includes(Number(id)),
              ...(timeUntilBreak !== 'Null' ? {timeUntilBreak: Number(timeUntilBreak)} : {}),
            }),
          )
          .sort(({id: idA}, {id: idB}) => idA - idB)
          .reduce((grouped, equip) => {
            if (!grouped.has(equip.itemId)) grouped.set(equip.itemId, []);
            grouped.get(equip.itemId).push(equip);
            return grouped;
          }, new Map<number, Array<EquipmentInfo>>());
      });
  }
}
