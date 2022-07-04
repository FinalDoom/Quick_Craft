import {diff} from 'deep-object-diff';
import Api, {EquipmentInfo} from '../api';
import {Observable} from '../util/observable';

type ItemCounts = Record<string, number>;
type EquipmentCounts = Record<number, Array<EquipmentInfo>>;

export class Inventory {
  #api: Api;
  #inventory: ItemCounts;
  #equipment: EquipmentCounts;
  #inventoryObservable = new Observable<ItemCounts>();
  #equipmentObservable = new Observable<EquipmentCounts>();

  constructor(api: Api) {
    this.#api = api;
  }

  async refreshInventory() {
    const updatedInventory = (await this.#api.getInventoryCounts()) || {};
    const changed = this.#inventory ? (diff(this.#inventory, updatedInventory) as ItemCounts) : updatedInventory;
    this.#inventory = updatedInventory;
    this.#inventoryObservable.notify(changed);
  }

  addOrSubtractItems(countChanges: ItemCounts) {
    Object.entries(countChanges).forEach(
      ([itemId, change]) => (countChanges[itemId] = this.#inventory[itemId] += change),
    );

    this.#inventoryObservable.notify(countChanges);
  }

  itemCount(itemId: keyof ItemCounts) {
    return this.#inventory[itemId];
  }

  get inventoryObservable() {
    return this.#inventoryObservable;
  }

  async refreshEquipment() {
    const updatedEquipment = (await this.#api.getEquipmentInfo()) || {};
    const changed = this.#equipment ? (diff(this.#equipment, updatedEquipment) as EquipmentCounts) : updatedEquipment;
    this.#equipment = updatedEquipment;
    this.#equipmentObservable.notify(changed);
  }

  get equipmentObservable() {
    return this.#equipmentObservable;
  }
}
