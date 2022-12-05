import {Book, Category, RecipeType} from '../generated/recipe_info';

enum Sort {
  alpha = 'Alphabetical',
  gold = 'Gold Value',
  book = 'Book Order',
  'book-alpha' = 'Books / Alphabetical',
  'book-gold' = 'Books / Gold',
}

interface GMStore {
  apiKey: string;
  currentCraft: string;
  extraSpace: boolean;
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

type GMKeys = {[key in keyof GMStore]: string};
export const GM_KEYS: GMKeys = {
  apiKey: 'forumgames_apikey',
  currentCraft: 'current-craft',
  extraSpace: 'SEG',
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
