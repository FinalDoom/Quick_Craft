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
    const metadataSearch = (indexName: string, metadata: (Book | Category | RecipeType)[]) => {
      if (metadata.length) {
        search += metadata.map((data) => indexName + ':' + data.split(/\s+/)[0]).join(' ');
      } else {
        search += indexName + ':' + invalidMetadataSearch;
      }
    };
    return {
      forText: function (text: string, includeIngredients: boolean) {
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
      },
      inBooks: function (books: Book[]) {
        metadataSearch(bookIndexName, books);
        return this;
      },
      inCategories: function (categories: Category[]) {
        metadataSearch(categoryIndexName, categories);
        return this;
      },
      ofTypes: function (types: RecipeType[]) {
        metadataSearch(typeIndexName, types);
        return this;
      },
      get: function () {
        return recipeSearchIndex.search(search).map((result) => Number(result.ref));
      },
    };
  },
};
