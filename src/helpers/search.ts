import lunr, {Token} from 'lunr';
import {Book, IdentifiedIngredient, ingredients, recipeInfo, RecipeInfo} from '../generated/recipe_info';

const bookIndexName: keyof RecipeInfo = 'book';
const categoryIndexName: keyof RecipeInfo = 'category';
const ingredientsIndexName = 'ingredients';
const nameIndexName: keyof RecipeInfo = 'name';
const resultIndexName = 'result';
const typeIndexName: keyof RecipeInfo = 'type';

const normalizer = (token: Token): null | Token | Token[] =>
  token.update((str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, ''));
lunr.Pipeline.registerFunction(normalizer, 'normalizer');

type RecipeSearch = lunr.Index & {
  byBooks: (selectedBooks: Book[]) => number[];
  bySearch: (search: string, searchIngredients?: boolean) => number[];
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

const recipeSearchHelper: RecipeSearch = Object.assign(recipeSearchIndex, {
  byBooks: (selectedBooks: Book[]) =>
    recipeSearchIndex
      .search(selectedBooks.map((book) => bookIndexName + ':' + book.split(/\s+/)[0]).join(' '))
      .map((result) => Number(result.ref)),
  bySearch: (search: string, searchIngredients: boolean) => {
    const searchString = search
      .split(/\s+/)
      .map((token) => {
        if (/:/.test(token)) return token;
        return token.replace(
          /^([-+]?)(.*)$/,
          `$1${nameIndexName}:$2 $1${resultIndexName}:$2` + (searchIngredients ? ` $1${ingredientsIndexName}:$2` : ''),
        );
      })
      .join(' ');
    return recipeSearchIndex.search(searchString).map((result) => Number(result.ref));
  },
});

export {recipeSearchHelper};
