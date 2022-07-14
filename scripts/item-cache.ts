import * as readline from 'readline';
import {decode} from 'html-entities';
import Api, {ApiResponse, isFailureResponse} from '../api/api';
import itemsApiCache from '../generated/api-dumped/items.json';

export default class ItemCache {
  #api: Api;
  #itemIdStringCache: Map<string, string> = new Map();

  constructor(api: Api) {
    this.#api = api;

    itemsApiCache.forEach((item) => {
      this.#itemIdStringCache.set(
        decode(item.name.toLocaleLowerCase().trim())
          .normalize('NFD')
          //.replace(/\p{Diacritic}/gu, '')
          .replace(/[^\w\s]/g, ''),
        parseInt(item.id).toString().padStart(5, '0'),
      );
    });
  }

  async findItemIdString(itemName: string): Promise<string> {
    if (!this.#itemIdStringCache.has(itemName))
      await this.#api
        .call({request: 'items', type: 'search', search: itemName})
        .then((response) => response.json())
        .then((response: ApiResponse<Array<number>>) => {
          if (isFailureResponse(response)) throw 'Bad response';
          const ids = response.response;
          if (ids.length > 1) {
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            });

            let id: string;
            while (id === undefined) {
              rl.question(`Choose an ID for ${itemName} [${ids.join('/')}]: `, (answer) => {
                const test = parseInt(answer);
                if (ids.includes(test)) {
                  id = String(test).padStart(5, '0');
                  rl.close();
                }
              });
            }
            this.#itemIdStringCache.set(itemName, id);
          } else {
            if (ids.length === 1) {
              this.#itemIdStringCache.set(itemName, ids[0].toString().padStart(5, '0'));
            }
          }
        });
    return this.#itemIdStringCache.get(itemName);
  }
}
