import lunr, {Token} from 'lunr';
import {
  Book,
  Category,
  IdentifiedIngredient,
  ingredients,
  recipeInfo,
  RecipeInfo,
  RecipeType,
} from '../generated/recipe_info';

const invalidMetadataSearch = 'INVALID_METADATA_FOR_ZERO_RESULTS';
const bookIndexName: keyof RecipeInfo = 'book';
const categoryIndexName: keyof RecipeInfo = 'category';
const ingredientsIndexName = 'ingredients';
const nameIndexName: keyof RecipeInfo = 'name';
const resultIndexName = 'result';
const typeIndexName: keyof RecipeInfo = 'type';

const normalizer = (token: Token): null | Token | Token[] =>
  token.update((str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, ''));
lunr.Pipeline.registerFunction(normalizer, 'normalizer');

type RecipeQuery = {
  forText: (text: string, includeIngredients: boolean) => RecipeQuery;
  inBooks: (book: Book[]) => RecipeQuery;
  inCategories: (categories: Category[]) => RecipeQuery;
  ofTypes: (types: RecipeType[]) => RecipeQuery;
  get: () => number[];
};
type RecipeSearch = lunr.Index & {
  query: () => RecipeQuery;
};

const recipeSearchIndex = lunr(function () {
  this.ref('id');

  this.field(nameIndexName);
  this.field(resultIndexName, {
    extractor: (doc: RecipeInfo) => String(doc.itemId) + ' ' + ingredients[doc.itemId].name,
  });
  this.field(bookIndexName);
  this.field(categoryIndexName);
  this.field(typeIndexName);
  this.field(ingredientsIndexName, {
    extractor: (doc: RecipeInfo) =>
      doc.ingredients.map((ingredient: IdentifiedIngredient) => ingredient.name + ' ' + ingredient.id).join(' '),
  });

  this.pipeline.remove(lunr.stopWordFilter);
  this.pipeline.before(lunr.stemmer, normalizer);

  recipeInfo.forEach((recipe) => this.add(recipe));
});

const getRecipeQuery: () => RecipeQuery = () => {
  let search = '';
  const metadataSearch = (indexName: string, metadata: (Book | Category | RecipeType)[]) => {
    if (metadata.length) {
      search += metadata.map((data) => indexName + ':' + data.split(/\s+/)[0]).join(' ');
    } else {
      search += indexName + ':' + invalidMetadataSearch;
    }
    return this;
  };
  const forText = (text: string, includeIngredients: boolean) => {
    if (text.length)
      search += text
        .split(/\s+/)
        .map((token) => {
          if (/:/.test(token)) return token;
          return token.replace(
            /^([-+]?)(.*)$/,
            `$1${nameIndexName}:$2 $1${resultIndexName}:$2` +
              (includeIngredients ? ` $1${ingredientsIndexName}:$2` : ''),
          );
        })
        .join(' ');
    return this;
  };
  const inBooks = (books: Book[]) => metadataSearch(bookIndexName, books);
  const inCategories = (categories: Category[]) => metadataSearch(categoryIndexName, categories);
  const ofTypes = (types: RecipeType[]) => metadataSearch(typeIndexName, types);
  const get = () => {
    return recipeSearchIndex.search(search).map((result) => Number(result.ref));
  };
  return {forText, inBooks, inCategories, ofTypes, get};
};
const recipeSearchHelper: RecipeSearch = Object.assign(recipeSearchIndex, {
  query: () => getRecipeQuery(),
});

export {recipeSearchHelper};
