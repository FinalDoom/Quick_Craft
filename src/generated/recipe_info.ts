import INGREDIENTS from './ingredients';
import RECIPES from './recipes';

export const CATEGORIES = Array.from(new Set(Object.values(INGREDIENTS).map(({category}) => category)));
export const BOOKS = Array.from(new Set(RECIPES.map(({book}) => book)));
export const RECIPE_TYPES = Array.from(new Set(RECIPES.map(({type}) => type)));

export type Book = typeof BOOKS[number];
export type Category = typeof CATEGORIES[number];
export type RecipeType = typeof RECIPE_TYPES[number];
export type Requirement = 1 | 2 | 3;

export type Ingredient = {
  name: string;
  image: string;
  category: string;
  gold: string;
  infStock: boolean;
  equipLife?: number;
};
export type GeneratedRecipe = {
  itemId: number;
  recipe: string;
  book: Book;
  type: RecipeType;
  requirement?: Requirement;
  name?: string;
};

export const ingredients = INGREDIENTS as unknown as Record<number, Ingredient>;
export const recipes = RECIPES as Array<GeneratedRecipe>;

//
// #endregion Typing and exports
//
