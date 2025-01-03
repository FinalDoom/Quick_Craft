import INGREDIENTS from './ingredients';
import RECIPES from './recipes';

export const CATEGORIES = Array.from(new Set(Object.values(INGREDIENTS).map(({category}) => category)));
export const BOOKS = Array.from(new Set(RECIPES.map(({book}) => book)));
export const RECIPE_TYPES = Array.from(new Set(RECIPES.map(({type}) => type)));

export type Book = (typeof BOOKS)[number];
export type Category = (typeof CATEGORIES)[number];
export type RecipeType = (typeof RECIPE_TYPES)[number];
export type Requirement = 1 | 2 | 3;

export type Ingredient = {
  readonly name: string;
  readonly image: string;
  readonly category: string;
  readonly gold: number;
  readonly infStock: boolean;
  readonly equipLife?: number;
};
export type IdentifiedIngredient = Ingredient & {id: number};
class GeneratedRecipeClass {
  constructor(
    readonly itemId: number,
    readonly recipe: string,
    readonly book: Book,
    readonly type: RecipeType,
    readonly requirement?: Requirement,
    readonly name?: string,
  ) {}
}
const GeneratedRecipeKeys = Object.keys(new GeneratedRecipeClass(0, '', '', ''));
export interface GeneratedRecipe extends GeneratedRecipeClass {}
export const isRecipeKey = (key: string): key is keyof GeneratedRecipe => {
  return GeneratedRecipeKeys.includes(key);
};

export interface RecipeInfo extends GeneratedRecipe {
  readonly id: number;
  readonly category: Category;
  readonly name: string;
  readonly ingredients: ReadonlyArray<IdentifiedIngredient>;
  readonly ingredientCounts: ReadonlyMap<number, number>;
}

const ITEM_ID_MATCHER = /.{5}/g;
export const recipeInfo = RECIPES.map<RecipeInfo>((recipe, id) => {
  const ingredientCounts = new Map<number, number>();
  recipe.recipe.match(ITEM_ID_MATCHER).forEach((item: string) => {
    if (item !== 'EEEEE') {
      const itemId = Number(item);
      if (!ingredientCounts.has(itemId)) ingredientCounts.set(itemId, 0);
      ingredientCounts.set(itemId, ingredientCounts.get(itemId) + 1);
    }
  });

  return {
    name: INGREDIENTS[recipe.itemId].name,
    id: id,
    category: INGREDIENTS[recipe.itemId].category,
    ingredientCounts: ingredientCounts,
    ingredients: [...ingredientCounts.entries()].map(([id, _]) => ({...INGREDIENTS[id], id: id})),
    ...recipe,
  } as RecipeInfo;
});

export const ingredients = INGREDIENTS as Readonly<Record<number, Ingredient>>;
export const recipes = RECIPES as GeneratedRecipe[];
