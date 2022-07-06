'use strict';

import './style/main.scss';

import {GazelleApi} from './api/api';
import {BOOKS, GeneratedRecipe, ingredients, recipes} from './generated/recipe_info';
import {take_craft} from './helpers/crafter';
import {ConsoleLog} from './log/log';
import {Inventory} from './models/inventory';
import {QuickCraftStore} from './store/store';
import CountingSet from './util/counting-set';

import pkg from '../package.json';

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

  let craftingSubmenu: HTMLDivElement;
  let isCrafting = false;

  function close_crafting_submenu() {
    if (craftingSubmenu) {
      craftingSubmenu.remove();
      STORE.currentCraft = craftingSubmenu = undefined;
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
      let craftNumberSelect: HTMLSelectElement;

      const doCraft = async () => {
        // Disable crafting buttons and craft switching
        isCrafting = true;
        Array.from(
          document.querySelectorAll<HTMLButtonElement | HTMLSelectElement>(
            '#crafting-submenu button, #crafting-submenu select',
          ),
        ).forEach((elem) => {
          elem.disabled = true;
          elem.classList.add('disabled');
        });

        let craftNumber = Number(craftNumberSelect.querySelector<HTMLOptionElement>('option:selected').value);

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
      const craftingActions = document.createElement('div');
      craftingActions.classList.add('crafting-panel-actions');

      craftNumberSelect = document.createElement('select');
      craftingActions.append(craftNumberSelect);
      Array(currentCraft.available)
        .fill(undefined)
        .forEach((_, i) => {
          const option = document.createElement('option');
          option.value = `${i + 1}`;
          option.innerText = `${i + 1}`;
          craftNumberSelect.append(option);
        });

      const craftButton = document.createElement('button');
      craftingActions.append(craftButton);
      craftButton.innerText = 'Craft';
      craftButton.addEventListener('click', doCraft);

      const maxButton = document.createElement('button');
      craftingActions.append(maxButton);
      maxButton.classList.add('crafting-panel-actions__max-craft-button');
      maxButton.innerText = 'Craft maximum';
      maxButton.addEventListener('click', function () {
        if (!maxButton.classList.contains('crafting-panel-actions__max-craft-button--confirm')) {
          craftNumberSelect.value = String(currentCraft.available);
          maxButton.innerText = '** CONFIRM **';
          maxButton.classList.add('crafting-panel-actions__max-craft-button--confirm');
        } else {
          maxButton.innerText = '-- Crafting --';
          doCraft();
        }
      });

      return craftingActions;
    };

    close_crafting_submenu();
    STORE.currentCraft = recipeName;

    const createIngredientLine = (ingredient: IngredientTemp, maxWithPurchase: number) => {
      const {id: ingredId, name: ingredName, onHand: qtyOnHand, qty: qtyPerCraft} = ingredient;
      const line = document.createElement('div');
      line.classList.add('crafting-panel-info__ingredient-row');
      if (STORE.switchNeedHave) {
        line.classList.add('crafting-panel-info__ingredient-quantity--swapped');
      }
      // Color ingredients marked purchased
      if (purchasable.includes(ingredName)) line.classList.add('crafting-panel-info__ingredient--purchasable');
      line.addEventListener('click', () => {
        if (purchasable.includes(ingredName)) {
          delete purchasable[purchasable.indexOf(ingredName)];
          purchasable = purchasable.flat();
        } else if (purchasable.length < currentCraft.ingredients.length - 1) purchasable.push(ingredName);
        close_crafting_submenu();
        open_crafting_submenu(recipe, purchasable);
      });

      const quickCraft = document.createElement('a');
      line.append(quickCraft);
      quickCraft.classList.add('crafting-panel-info__ingredient-shop-link');
      quickCraft.innerText = '$';
      quickCraft.href = `https://gazellegames.net/shop.php?ItemID=${ingredId}`;
      quickCraft.target = '_blank';

      line.append(`${titleCaseFromUnderscored(ingredName)}:`);

      const quantity = document.createElement('div');
      line.append(quantity);
      quantity.classList.add('crafting-panel-info__ingredient-quantity');

      const onHand = document.createElement('span');
      onHand.innerText = String(qtyOnHand);
      const sep = document.createElement('span');
      sep.innerText = '/';
      const perCraft = document.createElement('span');
      perCraft.innerText = String(qtyPerCraft);
      quantity.append(onHand, sep, perCraft);

      if (maxWithPurchase > qtyOnHand / qtyPerCraft) {
        const needed = document.createElement('span');
        needed.title = 'Needed for max possible crafts';
        needed.innerText = ` (+${maxWithPurchase * qtyPerCraft - qtyOnHand})`;
      }

      return line;
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

    craftingSubmenu = document.createElement('div');
    document.getElementById('current_craft_box').append(craftingSubmenu);
    craftingSubmenu.classList.add('crafting-panel');
    craftingSubmenu.id = 'crafting-submenu';

    const heading = document.createElement('div');
    craftingSubmenu.append(heading);
    heading.classList.add('crafting-panel__title');
    heading.innerText = ingredients[recipe.itemId].name;
    if (INVENTORY.itemCount(String(recipe.itemId)) > 0) {
      heading.innerText = heading.innerText + ` (${INVENTORY.itemCount(String(recipe.itemId))} in inventory)`;
    }

    const ingredientHeader = document.createElement('div');
    craftingSubmenu.append(ingredientHeader);
    ingredientHeader.classList.add('crafting-panel-info__ingredients-header');
    ingredientHeader.innerText = 'Ingredients:';

    const ingredientsDiv = document.createElement('div');
    craftingSubmenu.append(ingredientsDiv);
    ingredientsDiv.classList.add('crafting-panel-info__ingredients-column');
    currentCraft.ingredients.forEach((ingredient) =>
      ingredientsDiv.append(createIngredientLine(ingredient, maxWithPurchase)),
    );

    const max = document.createElement('span');
    craftingSubmenu.append(max);
    max.innerText = `Max available craft(s): ${currentCraft.available}`;
    max.classList.add('crafting-panel-info__ingredients-max');

    if (currentCraft.available !== maxWithPurchase) {
      const maxInfo = document.createElement('span');
      max.append(maxInfo);
      maxInfo.innerText = `(${maxWithPurchase})`;
      maxInfo.title = 'Max possible if additional ingredients are purchased';
    }

    const info = document.createElement('sup');
    max.append(info);
    const infoA = document.createElement('a');
    info.append(infoA);
    infoA.innerText = '?';
    infoA.title = 'Click ingredients to mark as purchasable and calculate +purchase needed and max possible crafted.';

    craftingSubmenu.append(createCraftingActions(currentCraft.available));
  }
  //
  // #region Create Recipe Book and Recipe buttons
  //

  let saveDebounce: number;

  //
  // Creates a Recipe button.
  //
  const createRecipeButton = (recipe: GeneratedRecipe) => {
    const name = recipe.name || ingredients[recipe.itemId].name;

    const button = document.createElement('button');
    button.classList.add(
      'recipes__recipe',
      `recipes__recipe--book-${recipe.book.toLocaleLowerCase().replace(/ /g, '-')}`,
    );
    button.id = `recipe_button-${name.replace(/ /g, '_')}`;
    button.innerText = name;

    button.addEventListener('click', () => {
      document.querySelector('.recipes__recipe--selected')?.classList.remove('recipes__recipe--selected');
      button.classList.add('recipes__recipe--selected');
      open_crafting_submenu(recipe, []);
    });

    return button;
  };

  const clearDiv = document.createElement('div');
  clearDiv.classList.add('crafting-clear');
  document.getElementById('crafting_recipes').before(clearDiv);

  const quickCrafter = document.createElement('div');
  document.getElementById('crafting_recipes').before(quickCrafter);
  quickCrafter.id = 'quick-crafter';

  const currentCraft = document.createElement('div');
  quickCrafter.append(currentCraft);
  currentCraft.id = 'current_craft_box';

  const help = document.createElement('p');
  quickCrafter.append(help);
  help.innerText =
    'Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.';

  const clear = document.createElement('button');
  quickCrafter.append(clear);
  clear.classList.add('crafting-panel-actions__clear-craft-button');
  clear.innerText = 'Clear';
  clear.addEventListener('click', close_crafting_submenu);

  const row = document.createElement('div');
  quickCrafter.append(row);
  row.classList.add('crafting-panel-actions__craft-row');

  const rowHelp = document.createElement('span');
  row.append(rowHelp);
  rowHelp.innerText = 'Click on the buttons below to show or hide crafting categories - ';

  const hideAll = document.createElement('button');
  row.append(hideAll);
  hideAll.classList.add('crafting-panel-filters__books-hide');
  hideAll.innerText = 'Hide all';
  hideAll.addEventListener('click', function () {
    BOOKS.forEach((book) => {
      if (STORE.selectedBooks.includes(book))
        document.getElementById(book.replace(/ /g, '_')).dispatchEvent(new MouseEvent('click'));
    });
  });

  const showAll = document.createElement('button');
  row.append(showAll);
  showAll.classList.add('crafting-panel-filters__books-show');
  showAll.innerText = 'Show all';
  showAll.addEventListener('click', function () {
    BOOKS.forEach((book) => {
      if (!STORE.selectedBooks.includes(book))
        document.getElementById(book.replace(/ /g, '_')).dispatchEvent(new MouseEvent('click'));
    });
  });

  const betweenBooksLabel = document.createElement('label');
  row.append(betweenBooksLabel);
  const betweenBooks = document.createElement('input');
  betweenBooksLabel.append(betweenBooks, 'Blank line between books');
  betweenBooks.type = 'checkbox';
  betweenBooks.classList.add('quick_craft_button');
  betweenBooks.checked = await GM.getValue('SEG', false);
  betweenBooks.addEventListener('change', function () {
    const checked = betweenBooks.checked;
    if (checked) {
      document.querySelector<HTMLDivElement>('.recipe-buttons').classList.add('recipe-buttons--extra-space');
    } else {
      document.querySelector<HTMLDivElement>('.recipe-buttons').classList.remove('recipe-buttons--extra-space');
    }
    GM.setValue('SEG', checked);
  });

  const nhSwitchLabel = document.createElement('label');
  row.append(nhSwitchLabel);
  const nhSwitch = document.createElement('input');
  nhSwitchLabel.append(nhSwitch, 'NH switch');
  nhSwitch.type = 'checkbox';
  nhSwitch.title = 'Switches between needed/have and have/needed';
  nhSwitch.checked = STORE.switchNeedHave;
  nhSwitch.addEventListener('change', function () {
    const checked = nhSwitch.checked;
    Array.from(document.querySelectorAll<HTMLDivElement>('.crafting-panel-info__ingredient-row')).forEach((elem) => {
      if (checked) {
        elem.classList.add('crafting-panel-info__ingredient-quantity--swapped');
      } else {
        elem.classList.remove('crafting-panel-info__ingredient-quantity--swapped');
      }
    });
    STORE.switchNeedHave = checked;
  });

  //
  // #region Add "Recipe Book" on/off buttons to DOM
  //
  const recipeButtons = document.createElement('div');
  quickCrafter.append(recipeButtons);
  recipeButtons.classList.add('crafting-panel-filters__books-row');

  BOOKS.forEach((name) => {
    const button = document.createElement('button');
    recipeButtons.append(button);
    button.classList.add(
      'crafting-panel-filters__books-button',
      `crafting-panel-filters__books-button--book-${name.toLocaleLowerCase().replace(/ /g, '-')}`,
    );
    if (STORE.selectedBooks.includes(name)) button.classList.add('crafting-panel-filters__books-button--selected');
    button.id = `${name.replace(/ /g, '_')}`;
    button.innerText = name;
    button.addEventListener('click', function () {
      if (saveDebounce) window.clearTimeout(saveDebounce);
      const selected = STORE.selectedBooks;
      const disabled = selected.includes(name);
      if (disabled) {
        document
          .getElementById(`recipe-buttons__book-section-${name.replace(/ /g, '_')}`)
          .classList.add('recipe-buttons__book-section--disabled');
      } else {
        document
          .getElementById(`recipe-buttons__book-section-${name.replace(/ /g, '_')}`)
          .classList.remove('recipe-buttons__book-section--disabled');
      }
      Array.from(
        document.querySelectorAll<HTMLButtonElement>(`.recipe_button-book_${name.replace(/ /g, '_')}`),
      ).forEach((elem) => (elem.disabled = disabled));
      if (disabled) {
        button.classList.remove('crafting-panel-filters__books-button--selected');
        delete selected[selected.indexOf(name)];
      } else {
        button.classList.add('crafting-panel-filters__books-button--selected');
        selected.push(name);
      }
      STORE.selectedBooks = selected.flat();
    });
  });
  //
  // #endregion Add "Recipe Book" on/off buttons to DOM
  //

  //
  // #region Add Recipe buttons to DOM
  //
  const recipeButtonDiv = document.createElement('div');
  quickCrafter.append(recipeButtonDiv);
  recipeButtonDiv.classList.add('recipe-buttons', 'recipe-buttons--book-sort');
  if (await GM.getValue('SEG', false)) recipeButtonDiv.classList.add('recipe-buttons--extra-space');

  BOOKS.forEach((bookName) => {
    const bookSection = document.createElement('div');
    recipeButtonDiv.append(bookSection);
    bookSection.classList.add('recipe-buttons__book-section');
    if (!STORE.selectedBooks.includes(bookName)) {
      bookSection.classList.add('recipe-buttons__book-section--disabled');
    } else {
      bookSection.classList.remove('recipe-buttons__book-section--disabled');
    }
    bookSection.id = `recipe-buttons__book-section-${bookName.replace(/ /g, '_')}`;

    recipes.filter(({book}) => book === bookName).forEach((recipe) => bookSection.append(createRecipeButton(recipe)));
  });
  //
  // #endregion Add Recipe buttons to DOM
  //

  const credit = document.createElement('p');
  quickCrafter.append(credit);
  credit.classList.add('credits');
  credit.innerHTML = `Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v<a href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">${pkg.version}</a>`;

  // Persist selected recipe
  if (STORE.currentCraft) {
    document
      .getElementById(`recipe_button-${STORE.currentCraft.replace(/ /g, '_')}`)
      .dispatchEvent(new MouseEvent('click'));
  }
})();
