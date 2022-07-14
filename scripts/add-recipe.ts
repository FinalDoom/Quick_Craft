import inquirer from 'inquirer';
import AutocompletePrompt from 'inquirer-autocomplete-prompt';
import TrieSearch from 'trie-search';
import JSON5 from 'json5';
// import {GazelleApi} from '../api';
// import {ConsoleLog} from '../log';
// import ItemCache from './item-cache';
import itemsApiCache from '../generated/api-dumped/items.json';
import bookMapping from '../generated/api-dumped/book-mapping.json';

type SlotArray = Array<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>;
type ItemIdentifier = string | number;
type RecipeArray =
  | [ItemIdentifier, SlotArray]
  | [ItemIdentifier, SlotArray, ItemIdentifier, SlotArray]
  | [ItemIdentifier, SlotArray, ItemIdentifier, SlotArray, ItemIdentifier, SlotArray]
  | [ItemIdentifier, SlotArray, ItemIdentifier, SlotArray, ItemIdentifier, SlotArray, ItemIdentifier, SlotArray]
  | [
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
    ]
  | [
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
    ]
  | [
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
    ]
  | [
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
    ]
  | [
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
      ItemIdentifier,
      SlotArray,
    ];
type RecipeIdentifier = RecipeArray | string;
interface HasName {
  name: ItemIdentifier;
}
interface HasRecipe {
  recipe: RecipeIdentifier;
}
interface FriendlyRecipe extends HasName, HasRecipe {
  result?: ItemIdentifier;
}
const isObject = (obj: unknown): obj is object => typeof obj === 'object';
const isItemIdentifier = (id: unknown): id is ItemIdentifier => typeof id === 'string' || typeof id === 'number';
const isSlotArray = (arr: unknown): arr is SlotArray => Array.isArray(arr) && arr.every((x) => typeof x === 'number');
const isRecipeArray = (recipeArr: unknown): recipeArr is RecipeArray =>
  Array.isArray(recipeArr) &&
  recipeArr.length % 2 === 0 &&
  recipeArr.every((x, i) => (i % 2 === 0 ? isItemIdentifier(x) : isSlotArray(x)));
const isRecipeString = (str: unknown): str is RecipeIdentifier => typeof str === 'string' && /.{45}/.test(str);
const isRecipeIdentifier = (id: unknown): id is RecipeIdentifier => isRecipeArray(id) || isRecipeString(id);
const hasName = (obj: unknown): obj is object & HasName => isObject(obj) && obj.hasOwnProperty('name');
const hasRecipe = (obj: unknown): obj is object & HasRecipe => isObject(obj) && obj.hasOwnProperty('recipe');
const isFriendlyRecipe = (recipe: unknown): recipe is FriendlyRecipe => {
  return hasName(recipe) && isItemIdentifier(recipe.name) && hasRecipe(recipe) && isRecipeIdentifier(recipe.recipe);
};

const example = {
  name: 'glass shards from sand',
  recipe: ['pile of sand', [4]],
  result: 'glass shards',
} as FriendlyRecipe;

if (!isFriendlyRecipe(example)) throw 'Bad example';

// const API = new GazelleApi(
//   new ConsoleLog('[Add Recipe]'),
//   '9a3cad59d85e132ac9b5b4646a683e193e1053e947b745ad9c6736ab1d96be00',
// );
// // TODO query for / store api key
// const CACHE = new ItemCache(API);

// const toRecipeString = async (recipe: RecipeArray): Promise<string> => {
//   const slots = new Array(9).fill('EEEEE');
//   for (let j = 0; j < recipe.length / 2; j++) {
//     const ingr = recipe[2 * j] as ItemIdentifier;
//     const itemId = CACHE.findItemIdString(
//       (parseInt(ingr as string) && ingredients[parseInt(ingr as string)].name) || (ingr as string),
//     );
//     const recipeSlotArray = recipe[2 * j + 1] as SlotArray;
//     for (let k = 0; k < slots.length; k++) {
//       slots[recipeSlotArray[k]] = itemId;
//     }
//   }
//   return slots.join('');
// };

const itemSearch = new TrieSearch(['id', 'name']);
itemSearch.addAll(itemsApiCache);
if (JSON5.parse('{asdf: 123}').asdf !== 123) console.log('fail');

const toRecipeString = (recipe: RecipeArray) => {
  const slots = new Array(9).fill('EEEEE');
  for (let j = 0; j < recipe.length / 2; j++) {
    const ingr = recipe[2 * j] as ItemIdentifier;
    const itemId = itemSearch.search(ingr).id.padStart(5, '0');
    const recipeSlotArray = recipe[2 * j + 1] as SlotArray;
    for (let k = 0; k < slots.length; k++) {
      slots[recipeSlotArray[k]] = itemId;
    }
  }
};

function promptForIngredient() {
  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'ingredient',
      message: 'Enter item name or id the recipe creates:',
      source: (_, input: string) => new Promise((resolve) => resolve(itemSearch.search(input))),
    },
    {
      type: 'input',
      name: 'slots',
      message: 'Enter the slot array, eg. [1,4]: ',
      when: (answers) => answers.ingredient !== '',
      validate: (input) => isRecipeArray(JSON5.parse(input)),
      filter: (input) => toRecipeString(JSON5.parse(input) as RecipeArray),
    },
  ]);
}

// input full definition
// - or
//   input result id or name
//   input optional friendly name
//   input recipe full definition array
//   - or loop to build
//     input name or id
//     input slot or slot array (repeat on slot)
// input / choose book
async function addRecipe() {
  inquirer.registerPrompt('autocomplete', AutocompletePrompt);
  inquirer
    .prompt([
      {
        type: 'rawlist',
        name: 'objectDefinitionMethod',
        message: `Add a newly defined recipe to the script by following the prompts.

You can follow prompts to build a recipe, or enter a defined recipe object, eg.
${JSON.stringify(example)}`,
        choices: ['Enter defined recipe object', 'Follow prompts'],
      },
      {
        type: 'input',
        name: 'recipe',
        message: 'Enter recipe object:',
        when: (answers) => answers.objectDefinitionMethod === 0,
        validate: (input) => isFriendlyRecipe(JSON5.parse(input)),
        filter: (input) => JSON5.parse(input) as FriendlyRecipe,
      },
      {
        type: 'autocomplete',
        name: 'recipe.result',
        message: 'Enter item name or id the recipe creates:',
        when: (answers) => answers.objectDefinitionMethod === 1,
        source: (_, input: string) => new Promise((resolve) => resolve(itemSearch.search(input))),
      },
      {
        type: 'input',
        name: 'recipe.name',
        when: (answers) => answers.objectDefinitionMethod === 1,
      },
      {
        type: 'rawlist',
        name: 'recipeDefinitionMethod',
        message: `You can define the recipe in several ways.
Recipe array, eg. ${JSON.stringify(example.recipe)}
Recipe string, eg. ${await toRecipeString(example.recipe as RecipeArray)}`,
        choices: ['Enter recipe string', 'Enter defined recipe array', 'Follow prompts'],
        when: (answers) => answers.objectDefinitionMethod === 1,
      },
      {
        type: 'input',
        name: 'recipe.recipe',
        message: 'Enter the string recipe definition:',
        when: (answers) => answers.recipeDefinitionMethod === 0,
        validate: (input) => /[0-9E]{45}/.test(input),
      },
      {
        type: 'input',
        name: 'recipe.recipe',
        message: `Enter the recipe array, eg. ${example.recipe}:`,
        when: (answers) => answers.recipeDefinitionMethod === 1,
        validate: (input) => isRecipeArray(JSON5.parse(input)),
        filter: (input) => toRecipeString(JSON5.parse(input) as RecipeArray),
      },
    ])
    .then(async (answers) => {
      if (answers.recipeDefinitionMethod === 2) {
        const recipeArray = [];
        let results;
        while (recipeArray.length == 0 || ((results = await promptForIngredient()) && results.ingredient)) {
          recipeArray.push(...results);
        }
        answers.recipe.recipe = await toRecipeString(recipeArray as RecipeArray);
      }
      return answers;
    })
    .then((answers) =>
      inquirer.prompt(
        {
          type: 'list',
          name: 'book',
          message: 'What book should the recipe belong to?',
          choices: Object.keys(bookMapping),
        },
        answers,
      ),
    )
    .then((answers) => console.log(answers));
}

addRecipe();

export default {};
