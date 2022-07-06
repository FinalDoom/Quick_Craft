import {Book, Category, CATEGORIES, RecipeType, RECIPE_TYPES} from '../generated/recipe_info';

enum Sort {
  alpha = 'Alphabetical',
  gold = 'Gold Value',
  book = 'Book Order',
  'book-alpha' = 'Books / Alphabetical',
  'book-gold' = 'Books / Gold',
}

interface StorableGM {
  apiKey: string;
  currentCraft: string;
  repairEquipped: boolean;
  repairThreshold: number;
  selectedBooks: Array<Book>;
  selectedCategories: Array<Category>;
  selectedCraftable: number;
  selectedTypes: Array<RecipeType>;
  search: string;
  searchIngredients: boolean;
  sort: Sort;
  switchNeedHave: boolean;
}
interface StorableLocalStorage {}
interface Storable extends StorableGM, StorableLocalStorage {}
export default interface Store extends Storable {}

type GMKeys = {[key in keyof StorableGM]: string};
const GM_KEYS: GMKeys = {
  apiKey: 'forumgames_apikey',
  currentCraft: 'current-craft',
  repairEquipped: 'repair-equipped',
  repairThreshold: 'repair-threshold',
  selectedBooks: 'selected-books',
  selectedCategories: 'selected-categories',
  selectedCraftable: 'selected-craftable',
  selectedTypes: 'selected-types',
  search: 'search-string',
  searchIngredients: 'search-ingredients',
  sort: 'recipe-sort',
  switchNeedHave: 'NHswitch', // TODO double check key.. if we care
};

export class QuickCraftStore implements Store {
  #apiKey: string;
  #currentCraft: string;
  #repairEquipped: boolean;
  #repairThreshold: number;
  #selectedBooks: Array<Book>;
  #selectedCategories: Array<Category>;
  #selectedCraftable: number;
  #selectedTypes: Array<RecipeType>;
  #search: string;
  #searchIngredients: boolean;
  #sort: Sort;
  #switchNeedHave: boolean;

  async init() {
    this.#apiKey = await this.#initGM('apiKey');
    this.#currentCraft = await this.#initGM('currentCraft', undefined);
    this.#repairEquipped = await this.#initGM('repairEquipped', false);
    this.#repairThreshold = await this.#initGM('repairThreshold', 0);
    this.#selectedBooks = await this.#initGM('selectedBooks', ['Potions', 'Food', 'Material Bars']);
    this.#selectedCategories = await this.#initGM('selectedCategories', CATEGORIES);
    this.#selectedCraftable = await this.#initGM('selectedCraftable', 0);
    this.#selectedTypes = await this.#initGM('selectedTypes', RECIPE_TYPES);
    this.#search = await this.#initGM('search', undefined);
    this.#searchIngredients = await this.#initGM('searchIngredients', true);
    this.#sort = await this.#initGM('sort', 'book');
    this.#switchNeedHave = await this.#initGM('switchNeedHave', false);

    window.addEventListener('storage', this.#storageListener);
  }

  async #initGM(name: keyof typeof GM_KEYS, defaultValue?: any) {
    if (!(await GM.getValue(GM_KEYS[name])) && defaultValue) {
      await GM.setValue(GM_KEYS[name], defaultValue);
      return defaultValue;
    }
    return await GM.getValue(GM_KEYS[name]);
  }

  #notifyStoreChanged(name: keyof Storable, oldValue: Storable[typeof name], newValue: Storable[typeof name]) {
    window.dispatchEvent(
      new StorageEvent('storage', {key: name, newValue: JSON.stringify(newValue), oldValue: JSON.stringify(oldValue)}),
    );
  }

  async #setGM(name: keyof typeof GM_KEYS, oldValue: Storable[typeof name], newValue: Storable[typeof name]) {
    if (oldValue !== newValue) {
      if (newValue !== undefined) await GM.setValue(GM_KEYS[name], newValue as GM.Value);
      else await GM.deleteValue(GM_KEYS[name]);
      this.#notifyStoreChanged(name, oldValue, newValue);
    }
  }

  #storageListener(storageEvent: StorageEvent) {
    if (storageEvent.key in this && storageEvent.key !== 'observable') {
      const key = storageEvent.key as keyof Storable;
      this[key] = JSON.parse(storageEvent.newValue) as never;
    }
  }

  get apiKey() {
    return this.#apiKey;
  }
  set apiKey(key) {
    const oldValue = this.#apiKey;
    this.#apiKey = key;
    this.#setGM('apiKey', oldValue, key);
  }

  get currentCraft() {
    return this.#currentCraft;
  }
  set currentCraft(craft) {
    const oldValue = this.#currentCraft;
    this.#currentCraft = craft;
    this.#setGM('currentCraft', oldValue, craft);
  }

  get repairEquipped() {
    return this.#repairEquipped;
  }
  set repairEquipped(allowRepairEquipped) {
    const oldValue = this.#repairEquipped;
    this.#repairEquipped = allowRepairEquipped;
    this.#setGM('repairEquipped', oldValue, allowRepairEquipped);
  }

  get repairThreshold() {
    return this.#repairThreshold;
  }
  set repairThreshold(threshold) {
    const oldValue = this.#repairThreshold;
    this.#repairThreshold = threshold;
    this.#setGM('repairThreshold', oldValue, threshold);
  }

  get selectedBooks() {
    return this.#selectedBooks;
  }
  set selectedBooks(books) {
    const oldValue = this.#selectedBooks;
    this.#selectedBooks = books;
    this.#setGM('selectedBooks', oldValue, books);
  }

  get selectedCategories() {
    return this.#selectedCategories;
  }
  set selectedCategories(categories) {
    const oldValue = this.#selectedCategories;
    this.#selectedCategories = categories;
    this.#setGM('selectedCategories', oldValue, categories);
  }

  get selectedCraftable() {
    return this.#selectedCraftable;
  }
  set selectedCraftable(craftable) {
    const oldValue = this.#selectedCraftable;
    this.#selectedCraftable = craftable;
    this.#setGM('selectedCraftable', oldValue, craftable);
  }

  get selectedTypes() {
    return this.#selectedTypes;
  }
  set selectedTypes(types) {
    const oldValue = this.#selectedTypes;
    this.#selectedTypes = types;
    this.#setGM('selectedTypes', oldValue, types);
  }

  get search() {
    return this.#search;
  }
  set search(search) {
    const oldValue = this.#search;
    this.#search = search;
    this.#setGM('search', oldValue, search);
  }

  get searchIngredients() {
    return this.#searchIngredients;
  }
  set searchIngredients(searchIngredients) {
    const oldValue = this.#searchIngredients;
    this.#searchIngredients = searchIngredients;
    this.#setGM('searchIngredients', oldValue, searchIngredients);
  }

  get sort() {
    return this.#sort;
  }
  set sort(sort) {
    const oldValue = this.#sort;
    this.#sort = sort;
    this.#setGM('sort', oldValue, sort);
  }

  get switchNeedHave() {
    return this.#switchNeedHave;
  }
  set switchNeedHave(isSwitched) {
    const oldValue = this.#switchNeedHave;
    this.#switchNeedHave = isSwitched;
    this.#setGM('switchNeedHave', oldValue, isSwitched);
  }
}
