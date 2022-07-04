import {GazelleApi} from './api';
import {BOOKS, GeneratedRecipe, ingredients, recipes} from './generated_data/recipe_info';
import {take_craft} from './helpers/crafter';
import {ConsoleLog} from './log';
import {Inventory} from './models/inventory';
import {QuickCraftStore} from './store';
import CountingSet from './util/counting-set';

import pkg from '../package.json';

('use strict');

const CRAFT_TIME = 1000;

declare global {
  interface Window {
    noty: (options: {type: 'error' | 'warn' | 'success'; text: string}) => void;
  }
}

(async function () {
  const LOG = new ConsoleLog('[Quick Crafter]');
  const STORE = new QuickCraftStore();
  await STORE.init();

  function askForApiKey() {
    if (!STORE.apiKey) {
      const input = window.prompt(`Please input your GGn API key.
If you don't have one, please generate one from your Edit Profile page: https://gazellegames.net/user.php?action=edit.
The API key must have "Items" permission

Please disable this userscript until you have one as this prompt will continue to show until you enter one in.`);
      const trimmed = input.trim();

      if (/[a-f0-9]{64}/.test(trimmed)) {
        STORE.apiKey = trimmed;
        return STORE.apiKey;
      } else {
        throw 'No API key found.';
      }
    }
  }

  const API = new GazelleApi(LOG, STORE.apiKey || askForApiKey());
  const INVENTORY = new Inventory(API);
  await INVENTORY.refreshInventory();

  // TODO rest of the script that was pulled from original userscript with minor changes

  function titleCaseFromUnderscored(str) {
    return str.replace(/_/g, ' ').replace(/(?:^|\s)\w/g, function (match) {
      return match.toUpperCase();
    });
  }

  //
  // #region Stylesheets
  //
  const styleExtraBookSpace = $(`<style>
.recipe_buttons {
    row-gap: 1rem;
}
</style>`);
  const styleIngredientQuantity = $(`<style>
.ingredient_quantity {
    flex-direction: row;
}
</style>`);
  const styleIngredientQuantitySwap = $(`<style>
.ingredient_quantity {
    flex-direction: row-reverse;
}
</style>`);
  const head = $('head');
  head.append(`<style>
.disabled {
    background-color: #333 !important;
    color: #666 !important;
    pointer-events: none;
}
a.disabled {
    pointer-events: none;
}
.quick_craft_button {
    margin-left: 2rem;
    background-color: orange;
}
.quick_craft_button_confirm {
    background-color: red;
}
.recipe_buttons {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
}
</style>`);
  if (await GM.getValue('SEG', false)) {
    head.append(styleExtraBookSpace);
  }
  if (STORE.switchNeedHave) {
    head.append(styleIngredientQuantitySwap);
  } else {
    head.append(styleIngredientQuantity);
  }
  //
  // #endregion Stylesheets
  //

  let craftingSubmenu: JQuery;
  let isCrafting = false;

  function close_crafting_submenu() {
    if (craftingSubmenu) {
      craftingSubmenu.remove();
      STORE.currentCraft = undefined;
    }
  }

  type IngredientTemp = {id: number; name: string; onHand: number; qty: number};

  async function open_crafting_submenu(recipe: GeneratedRecipe, purchasable: Array<string>) {
    if (isCrafting) return;

    const recipeName = recipe.name || ingredients[recipe.itemId].name;
    const currentCraft = {available: Number.MAX_SAFE_INTEGER, ingredients: [] as Array<IngredientTemp>};
    const recipeIngredients = recipe.recipe.match(/.{5}/g);
    const ingredientCounts = new CountingSet<string>();
    recipeIngredients.forEach((item) => ingredientCounts.add(item));
    ingredientCounts.delete('EEEEE');
    for (let [id, perCraft] of ingredientCounts.entries()) {
      const onHand = INVENTORY.itemCount(String(parseInt(id))) || 0;
      const avail = Math.floor(onHand / perCraft);
      if (avail < currentCraft.available) {
        currentCraft.available = avail;
      }
      currentCraft.ingredients.push({
        name: recipeName,
        id: recipe.itemId,
        qty: perCraft,
        onHand: onHand,
      });
    }

    const createCraftingActions = (available: number) => {
      if (available <= 0) {
        return '';
      }
      let craftNumberSelect: JQuery;

      const doCraft = async () => {
        // Disable crafting buttons and craft switching
        isCrafting = true;
        $('#crafting-submenu button, #crafting-submenu select').prop('disabled', true).addClass('disabled');

        let craftNumber = craftNumberSelect.children('option:selected').val();

        await (async () => {
          for (let i = 0; i < craftNumber; i++) {
            await new Promise<void>((resolve) =>
              setTimeout(function () {
                take_craft(recipe);
                INVENTORY.addOrSubtractItems({[recipe.itemId]: 1});
                resolve();
              }, CRAFT_TIME),
            );
          }
          isCrafting = false;
          await open_crafting_submenu(recipe, purchasable);
        })();
      };
      console.log('wat', currentCraft.available);
      return $('<div>')
        .css({display: 'flex', flexDirection: 'row', columnGap: '.25rem', alignItems: 'center', alignSelf: 'center'})
        .append(
          (craftNumberSelect = $('<select>').append(
            ...Array(currentCraft.available)
              .fill(undefined)
              .map((_, i) => `<option value="${i + 1}">${i + 1}</option>`),
          )),
        )
        .append($('<button>Craft</button>').click(doCraft))
        .append(
          $('<button class="quick_craft_button">Craft maximum</button>').click(function () {
            if (!$(this).hasClass('quick_craft_button_confirm')) {
              craftNumberSelect.val(currentCraft.available);
              $(this).text('** CONFIRM **').addClass('quick_craft_button_confirm');
            } else {
              $(this).text('-- Crafting --');
              doCraft();
            }
          }),
        );
    };

    close_crafting_submenu();
    STORE.currentCraft = recipeName;

    const createIngredientLine = (ingredient: IngredientTemp, maxWithPurchase: number) => {
      const {id: ingredId, name: ingredName, onHand: qtyOnHand, qty: qtyPerCraft} = ingredient;
      return $('<div>')
        .css({
          // Color ingredients marked purchased
          ...(purchasable.includes(ingredName) ? {color: 'lightGreen'} : {}),
          display: 'flex',
          flexDirection: 'row',
          columnGap: '.25rem',
          alignItems: 'center',
          alignSelf: 'center',
        })
        .append(
          $('<a class="quick_craft_button">$</a>')
            .attr('href', `https://gazellegames.net/shop.php?ItemID=${ingredId}`)
            .attr('target', '_blank')
            .css({
              borderRadius: '50%',
              backgroundColor: 'yellow',
              color: 'black',
              cursor: 'pointer',
              padding: '0 .25rem',
            }),
          `${titleCaseFromUnderscored(ingredName)}:`,
          `<div style="display: inline-flex;" class="ingredient_quantity"><span>${qtyOnHand}</span><span>/</span><span>${qtyPerCraft}</span></div>`,
          maxWithPurchase > qtyOnHand / qtyPerCraft
            ? `<span title="Needed for max possible crafts"> (+${maxWithPurchase * qtyPerCraft - qtyOnHand})</span>`
            : '',
        )
        .on('click', () => {
          if (purchasable.includes(ingredName)) {
            delete purchasable[purchasable.indexOf(ingredName)];
            purchasable = purchasable.flat();
          } else if (purchasable.length < currentCraft.ingredients.length - 1) purchasable.push(ingredName);
          close_crafting_submenu();
          open_crafting_submenu(recipe, purchasable);
        });
    };

    const maxWithPurchase = purchasable.length
      ? Math.min(
          ...currentCraft.ingredients.map((ingredient) =>
            purchasable.includes(ingredient.name)
              ? Number.MAX_SAFE_INTEGER
              : Math.floor(ingredient.onHand / ingredient.qty),
          ),
        )
      : currentCraft.available;

    $('#current_craft_box').append(
      (craftingSubmenu = $('<div id="crafting-submenu">')
        .css({textAlign: 'center', marginBottom: '1rem', display: 'flex', flexDirection: 'column', rowGap: '1rem'})
        .append(
          $('<div>')
            .text(ingredients[recipe.itemId].name)
            .css({marginBottom: '.5rem'})
            .append(
              INVENTORY.itemCount(String(recipe.itemId)) > 0
                ? ` (${INVENTORY.itemCount(String(recipe.itemId))} in inventory)`
                : '',
            ),
        )
        .append('<div style="margin-bottom: .5rem;">Ingredients:</div>')
        .append(
          $('<div>')
            .css({display: 'flex', flexDirection: 'column'})
            .append(currentCraft.ingredients.map((ingredient) => createIngredientLine(ingredient, maxWithPurchase))),
        )
        .append(
          $(`<span>`)
            .text(`Max available craft(s): ${currentCraft.available}`)
            .css({marginBottom: '1rem'})
            .append(
              currentCraft.available !== maxWithPurchase
                ? $(`<span>`)
                    .text(`(${maxWithPurchase})`)
                    .prop('title', 'Max possible if additional ingredients are purchased')
                    .css({marginLeft: '5px'})
                : '',
              $('<a>')
                .text('?')
                .attr(
                  'title',
                  'Click ingredients to mark as purchasable and calculate +purchase needed and max possible crafted.',
                )
                .wrap('<sup>')
                .parent(),
            ),
        )
        .append(createCraftingActions(currentCraft.available))),
    );
  }
  //
  // #region Create Recipe Book and Recipe buttons
  //

  let saveDebounce: number;

  const bookColors = {
    Glass: {bgcolor: 'white', color: 'black'},
    Potions: {bgcolor: 'green', color: 'white'},
    // Luck: {bgcolor: 'blue', color: 'white'},
    Food: {bgcolor: 'wheat', color: 'black'},
    Pets: {bgcolor: 'brown', color: 'beige'},
    Material_Bars: {bgcolor: 'purple', color: 'white'},
    Armor: {bgcolor: 'darkblue', color: 'white'},
    Weapons: {bgcolor: 'darkred', color: 'white'},
    Recasting: {bgcolor: 'gray', color: 'white'},
    Jewelry: {bgcolor: 'deeppink', color: 'white'},
    Bling: {bgcolor: 'gold', color: 'darkgray'},
    Trading_Decks: {bgcolor: '#15273F', color: 'white'},
    Xmas_Crafting: {bgcolor: 'red', color: 'lightgreen'},
    Birthday: {bgcolor: 'dark', color: 'gold'},
    Valentines: {bgcolor: 'pink', color: 'deeppink'},
    Adventure_Club: {bgcolor: 'yellow', color: 'black'},
    Halloween: {bgcolor: 'gray', color: 'black'},
  };

  //
  // Creates a Recipe button.
  //
  const createRecipeButton = (recipe: GeneratedRecipe) => {
    const name = recipe.name || ingredients[recipe.itemId].name;

    return $(
      `<button class="recipe_button-book_${recipe.book.replace(/ /g, '_')}" id="recipe_button-${name.replace(
        / /g,
        '_',
      )}">${name}</button>`,
    )
      .css({
        backgroundColor: bookColors[recipe.book.replace(/ /g, '_')].bgcolor,
        color: bookColors[recipe.book.replace(/ /g, '_')].color,
        border: '2px solid transparent',
        marginTop: '3px',
        marginRight: '5px',
      })
      .focus(function () {
        document.getElementById(`recipe_button-${name.replace(/ /g, '_')}`).style.border = '2px solid red';
      })
      .blur(function () {
        document.getElementById(`recipe_button-${name.replace(/ /g, '_')}`).style.border = '2px solid transparent';
      })
      .click(() => open_crafting_submenu(recipe, []));
  };

  $('#crafting_recipes').before(
    '<div style="clear: both; margin-bottom: 1rem;">',
    $('<div id="quick-crafter">')
      .css({
        display: 'block',
        margin: '0 auto 1rem',
        backgroundColor: 'rgba(19,9,0,.7)',
        padding: '5px',
        width: '100%',
        maxWidth: '1100px',
        minWidth: '200px',
      })
      .append(
        '<div id="current_craft_box">',
        '<p>Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.</p>',
        $('<button class="quick_craft_button">Clear</button>')
          .css({marginBottom: '1rem', backgroundColor: 'red'})
          .click(() => close_crafting_submenu()),
        $('<div>')
          .css({display: 'flex', flexDirection: 'row', columnGap: '.25rem', alignItems: 'center'})
          .append(
            '<span>Click on the buttons below to show or hide crafting categories - </span>',
            $('<button class="quick_craft_button">Hide all</button>')
              .css({backgroundColor: 'red'})
              .click(function () {
                BOOKS.forEach((book) => {
                  if (STORE.selectedBooks.includes(book)) $(`#${book.replace(/ /g, '_')}`).trigger('click');
                });
              }),
            $('<button class="quick_craft_button">Show all</button>')
              .css({backgroundColor: 'green'})
              .click(function () {
                BOOKS.forEach((book) => {
                  if (!STORE.selectedBooks.includes(book)) $(`#${book.replace(/ /g, '_')}`).trigger('click');
                });
              }),
            $('<input type="checkbox" class="quick_craft_button">Blank line between books</input>')
              .prop('checked', await GM.getValue('SEG', false))
              .change(function () {
                const checked = $(this).prop('checked');
                if (checked) {
                  $('head').append(styleExtraBookSpace);
                } else {
                  styleExtraBookSpace.remove();
                }
                GM.setValue('SEG', checked);
              }),
            $(
              '<input type="checkbox" class="quick_craft_button" title="Switches between needed/have and have/needed">NH switch</input>',
            )
              .prop('checked', STORE.switchNeedHave)
              .change(function () {
                const checked = $(this).prop('checked');
                if (checked) {
                  styleIngredientQuantity.remove();
                  $('head').append(styleIngredientQuantitySwap);
                } else {
                  styleIngredientQuantitySwap.remove();
                  $('head').append(styleIngredientQuantity);
                }
                STORE.switchNeedHave = checked;
              }),
          ),
      )

      //
      // #region Add "Recipe Book" on/off buttons to DOM
      //
      .append(
        $('<div>')
          .css({marginBottom: '2rem', display: 'flex', flexDirection: 'row', columnGap: '.25rem', alignItems: 'center'})
          .append(
            BOOKS.map((name) => {
              const {bgcolor, color} = bookColors[name.replace(/ /g, '_')];

              const button = $(`<button id="${name.replace(/ /g, '_')}" class="qcbutton_book">${name}</button>`)
                .css({backgroundColor: bgcolor, color: color, opacity: STORE.selectedBooks.includes(name) ? 1 : 0.2})
                .click(function () {
                  if (saveDebounce) window.clearTimeout(saveDebounce);
                  const selected = STORE.selectedBooks;
                  const disabled = selected.includes(name);
                  $(this).css('opacity', disabled ? 0.2 : 1);
                  $(`#recipe_book_section-${name.replace(/ /g, '_')}`).css('display', disabled ? 'none' : '');
                  $(`.recipe_button-book_${name.replace(/ /g, '_')}`).prop('disabled', disabled);
                  if (disabled) {
                    delete selected[selected.indexOf(name)];
                  } else {
                    selected.push(name);
                  }
                  STORE.selectedBooks = selected.flat();
                });
              return button;
            }),
          ),
      )
      //
      // #endregion Add "Recipe Book" on/off buttons to DOM
      //

      //
      // #region Add Recipe buttons to DOM
      //
      .append(
        $('<div class="recipe_buttons">').append(
          BOOKS.map((bookName) =>
            $(`<div class="recipe_book_section" id="recipe_book_section-${bookName.replace(/ /g, '_')}">`)
              .append(recipes.filter(({book}) => book === bookName).map((recipe) => createRecipeButton(recipe)))
              .css({display: !STORE.selectedBooks.includes(bookName) ? 'none' : ''}),
          ),
        ),
      )
      //
      // #endregion Add Recipe buttons to DOM
      //

      .append(
        `<p style="float:right;margin-top:-20px;margin-right:5px;">Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v<a href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">${pkg.version}</a></p>`,
      ),
  );

  // Persist selected recipe
  if (STORE.currentCraft) $(`#${STORE.currentCraft.replace(/ /g, '_')}`).trigger('click');
})();
