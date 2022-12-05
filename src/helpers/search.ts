import lunr, {Token} from 'lunr';
import {
  Book,
  BOOKS,
  CATEGORIES,
  Category,
  IdentifiedIngredient,
  ingredients,
  recipeInfo,
  RecipeInfo,
  RecipeType,
  RECIPE_TYPES,
} from '../generated/recipe_info';

const bookIndexName: keyof RecipeInfo = 'book';
const categoryIndexName: keyof RecipeInfo = 'category';
const ingredientsIndexName = 'ingredients';
const nameIndexName: keyof RecipeInfo = 'name';
const resultIndexName = 'result';
const typeIndexName: keyof RecipeInfo = 'type';

const normalizer = (token: Token): null | Token | Token[] =>
  token.update((str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, ''));
lunr.Pipeline.registerFunction(normalizer, 'normalizer');

type RecipeQueryBuilder = {
  forText: (text: string, includeIngredients: boolean) => RecipeQueryBuilder;
  inBooks: (book: Book[]) => RecipeQueryBuilder;
  inCategories: (categories: Category[]) => RecipeQueryBuilder;
  ofTypes: (types: RecipeType[]) => RecipeQueryBuilder;
  get: () => number[];
};
type RecipeSearchHelper = {
  query: () => RecipeQueryBuilder;
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

export const recipeSearchHelper: RecipeSearchHelper = {
  query: function getRecipeQueryBuilder(): RecipeQueryBuilder {
    let search = '';
    const metadataSearch = (
      indexName: string,
      metadata: (Book | Category | RecipeType)[],
      allMetadata: (Book | Category | RecipeType)[],
    ) => {
      if (search.length) search += ' ';
      const metadataSet = new Set(metadata);
      const excludedMetadata = allMetadata.filter((data) => !metadataSet.has(data));
      search += excludedMetadata.map((data) => '-' + indexName + ':' + data.split(/\s+/)[0]).join(' ');
    };
    return {
      forText: function (text: string, includeIngredients: boolean) {
        if (text.length) {
          if (search.length) search += ' ';
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
        }
        return this;
      },
      inBooks: function (books: Book[]) {
        metadataSearch(bookIndexName, books, BOOKS);
        return this;
      },
      inCategories: function (categories: Category[]) {
        metadataSearch(categoryIndexName, categories, CATEGORIES);
        return this;
      },
      ofTypes: function (types: RecipeType[]) {
        metadataSearch(typeIndexName, types, RECIPE_TYPES);
        return this;
      },
      get: function () {
        return recipeSearchIndex.search(search).map((result) => Number(result.ref));
      },
    };
  },
};
