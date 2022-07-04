'use strict';

import {GazelleApi} from './api';
import {BOOKS, GeneratedRecipe, ingredients, recipes} from './generated_data/recipe_info';
import {take_craft} from './helpers/crafter';
import {ConsoleLog} from './log';
import {Inventory} from './models/inventory';
import {QuickCraftStore} from './store';
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

  //
  // #region Stylesheets
  //
  const styleExtraBookSpace = document.createElement('style');
  styleExtraBookSpace.innerHTML = `
.recipe_buttons {
    row-gap: 1rem;
}`;
  const styleIngredientQuantity = document.createElement('style');
  styleIngredientQuantity.innerHTML = `
.ingredient_quantity {
    flex-direction: row;
}`;
  const styleIngredientQuantitySwap = document.createElement('style');
  styleIngredientQuantitySwap.innerHTML = `
.ingredient_quantity {
    flex-direction: row-reverse;
}`;
  const styleMain = document.createElement('style');
  styleMain.innerHTML = `
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
}`;
  document.head.append(styleMain);

  if (await GM.getValue('SEG', false)) {
    document.head.append(styleExtraBookSpace);
  }
  if (STORE.switchNeedHave) {
    document.head.append(styleIngredientQuantitySwap);
  } else {
    document.head.append(styleIngredientQuantity);
  }
  //
  // #endregion Stylesheets
  //

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
      craftingActions.style.display = 'flex';
      craftingActions.style.flexDirection = 'row';
      craftingActions.style.columnGap = '.25rem';
      craftingActions.style.alignItems = 'center';
      craftingActions.style.alignSelf = 'center';

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
      maxButton.classList.add('quick_craft_button');
      maxButton.innerText = 'Craft maximum';
      maxButton.addEventListener('click', function () {
        if (!maxButton.classList.contains('quick_craft_button_confirm')) {
          craftNumberSelect.value = String(currentCraft.available);
          maxButton.innerText = '** CONFIRM **';
          maxButton.classList.add('quick_craft_button_confirm');
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
      // Color ingredients marked purchased
      if (purchasable.includes(ingredName)) line.style.color = 'lightGreen';
      line.style.display = 'flex';
      line.style.flexDirection = 'row';
      line.style.columnGap = '.25rem';
      line.style.alignItems = 'center';
      line.style.alignSelf = 'center';
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
      quickCraft.classList.add('quick_craft_button');
      quickCraft.innerText = '$';
      quickCraft.href = `https://gazellegames.net/shop.php?ItemID=${ingredId}`;
      quickCraft.target = '_blank';
      quickCraft.style.borderRadius = '50%';
      quickCraft.style.backgroundColor = 'yellow';
      quickCraft.style.color = 'black';
      quickCraft.style.cursor = 'pointer';
      quickCraft.style.padding = '0 .25rem';

      line.append(`${titleCaseFromUnderscored(ingredName)}:`);

      const quantity = document.createElement('div');
      line.append(quantity);
      quantity.style.display = 'inline-flex';
      quantity.classList.add('ingredient_quantity');

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
    craftingSubmenu.id = 'crafting-submenu';
    craftingSubmenu.style.textAlign = 'center';
    craftingSubmenu.style.marginBottom = '1rem';
    craftingSubmenu.style.display = 'flex';
    craftingSubmenu.style.flexDirection = 'column';
    craftingSubmenu.style.rowGap = '1rem';

    const heading = document.createElement('div');
    craftingSubmenu.append(heading);
    heading.innerText = ingredients[recipe.itemId].name;
    heading.style.marginBottom = '.5rem';
    if (INVENTORY.itemCount(String(recipe.itemId)) > 0) {
      heading.innerText = heading.innerText + ` (${INVENTORY.itemCount(String(recipe.itemId))} in inventory)`;
    }

    const ingredientHeader = document.createElement('div');
    craftingSubmenu.append(ingredientHeader);
    ingredientHeader.style.marginBottom = '.5rem';
    ingredientHeader.innerText = 'Ingredients:';

    const ingredientsDiv = document.createElement('div');
    craftingSubmenu.append(ingredientsDiv);
    ingredientsDiv.style.display = 'flex';
    ingredientsDiv.style.flexDirection = 'column';
    currentCraft.ingredients.forEach((ingredient) =>
      ingredientsDiv.append(createIngredientLine(ingredient, maxWithPurchase)),
    );

    const max = document.createElement('span');
    craftingSubmenu.append(max);
    max.innerText = `Max available craft(s): ${currentCraft.available}`;
    max.style.marginBottom = '1rem';

    if (currentCraft.available !== maxWithPurchase) {
      const maxInfo = document.createElement('span');
      max.append(maxInfo);
      maxInfo.innerText = `(${maxWithPurchase})`;
      maxInfo.title = 'Max possible if additional ingredients are purchased';
      maxInfo.style.marginLeft = '5px';
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

    const button = document.createElement('button');
    button.classList.add(`recipe_button-book_${recipe.book.replace(/ /g, '_')}`);
    button.id = `recipe_button-${name.replace(/ /g, '_')}`;
    button.innerText = name;
    button.style.backgroundColor = bookColors[recipe.book.replace(/ /g, '_')].bgcolor;
    button.style.color = bookColors[recipe.book.replace(/ /g, '_')].color;
    button.style.border = '2px solid transparent';
    button.style.marginTop = '3px';
    button.style.marginRight = '5px';

    button.addEventListener('focus', () => (button.style.border = '2px solid red'));
    button.addEventListener('blur', () => (button.style.border = '2px solid transparent'));
    button.addEventListener('click', () => open_crafting_submenu(recipe, []));

    return button;
  };

  const clearDiv = document.createElement('div');
  document.getElementById('crafting_recipes').before(clearDiv);
  clearDiv.style.clear = 'both';
  clearDiv.style.marginBottom = '1rem';

  const quickCrafter = document.createElement('div');
  document.getElementById('crafting_recipes').before(quickCrafter);
  quickCrafter.id = 'quick-crafter';
  quickCrafter.style.display = 'block';
  quickCrafter.style.margin = '0 auto 1rem';
  quickCrafter.style.backgroundColor = 'rgba(19,9,0,.7)';
  quickCrafter.style.padding = '5px';
  quickCrafter.style.width = '100%';
  quickCrafter.style.maxWidth = '1100px';
  quickCrafter.style.minWidth = '200px';

  const currentCraft = document.createElement('div');
  quickCrafter.append(currentCraft);
  currentCraft.id = 'current_craft_box';

  const help = document.createElement('p');
  quickCrafter.append(help);
  help.innerText =
    'Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better experience.';

  const clear = document.createElement('button');
  quickCrafter.append(clear);
  clear.classList.add('quick_craft_button');
  clear.innerText = 'Clear';
  clear.style.marginBottom = '1rem';
  clear.style.backgroundColor = 'red';
  clear.addEventListener('click', close_crafting_submenu);

  const row = document.createElement('div');
  quickCrafter.append(row);
  row.style.display = 'flex';
  row.style.flexDirection = 'row';
  row.style.columnGap = '.25rem';
  row.style.alignItems = 'center';

  const rowHelp = document.createElement('span');
  row.append(rowHelp);
  rowHelp.innerText = 'Click on the buttons below to show or hide crafting categories - ';

  const hideAll = document.createElement('button');
  row.append(hideAll);
  hideAll.classList.add('quick_craft_button');
  hideAll.innerText = 'Hide all';
  hideAll.style.backgroundColor = 'red';
  hideAll.addEventListener('click', function () {
    BOOKS.forEach((book) => {
      if (STORE.selectedBooks.includes(book))
        document.getElementById(book.replace(/ /g, '_')).dispatchEvent(new MouseEvent('click'));
    });
  });

  const showAll = document.createElement('button');
  row.append(showAll);
  showAll.classList.add('quick_craft_button');
  showAll.innerText = 'Show all';
  showAll.style.backgroundColor = 'green';
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
      document.head.append(styleExtraBookSpace);
    } else {
      document.removeChild(styleExtraBookSpace);
    }
    GM.setValue('SEG', checked);
  });

  const nhSwitchLabel = document.createElement('label');
  row.append(nhSwitchLabel);
  const nhSwitch = document.createElement('input');
  nhSwitchLabel.append(nhSwitch, 'NH switch');
  nhSwitch.type = 'checkbox';
  nhSwitch.classList.add('quick_craft_button');
  nhSwitch.title = 'Switches between needed/have and have/needed';
  nhSwitch.checked = STORE.switchNeedHave;
  nhSwitch.addEventListener('change', function () {
    const checked = nhSwitch.checked;
    if (checked) {
      styleIngredientQuantity.remove();
      document.head.append(styleIngredientQuantitySwap);
    } else {
      styleIngredientQuantitySwap.remove();
      document.head.append(styleIngredientQuantity);
    }
    STORE.switchNeedHave = checked;
  });

  //
  // #region Add "Recipe Book" on/off buttons to DOM
  //
  const recipeButtons = document.createElement('div');
  quickCrafter.append(recipeButtons);
  recipeButtons.style.marginBottom = '2rem';
  recipeButtons.style.display = 'flex';
  recipeButtons.style.flexDirection = 'row';
  recipeButtons.style.columnGap = '.25rem';
  recipeButtons.style.alignItems = 'center';

  BOOKS.forEach((name) => {
    const {bgcolor, color} = bookColors[name.replace(/ /g, '_')];

    const button = document.createElement('button');
    recipeButtons.append(button);
    button.id = `${name.replace(/ /g, '_')}`;
    button.classList.add('qcbutton_book');
    button.innerText = name;
    button.style.backgroundColor = bgcolor;
    button.style.color = color;
    button.style.opacity = STORE.selectedBooks.includes(name) ? '1' : '0.2';
    button.addEventListener('click', function () {
      if (saveDebounce) window.clearTimeout(saveDebounce);
      const selected = STORE.selectedBooks;
      const disabled = selected.includes(name);
      button.style.opacity = disabled ? '0.2' : '1';
      document.getElementById(`recipe_book_section-${name.replace(/ /g, '_')}`).style.display = disabled ? 'none' : '';
      Array.from(
        document.querySelectorAll<HTMLButtonElement>(`.recipe_button-book_${name.replace(/ /g, '_')}`),
      ).forEach((elem) => (elem.disabled = disabled));
      if (disabled) {
        delete selected[selected.indexOf(name)];
      } else {
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
  recipeButtonDiv.classList.add('recipe_buttons');

  BOOKS.forEach((bookName) => {
    const bookSection = document.createElement('div');
    recipeButtonDiv.append(bookSection);
    bookSection.classList.add('recipe_book_section');
    bookSection.id = `recipe_book_section-${bookName.replace(/ /g, '_')}`;
    bookSection.style.display = !STORE.selectedBooks.includes(bookName) ? 'none' : '';

    recipes.filter(({book}) => book === bookName).forEach((recipe) => bookSection.append(createRecipeButton(recipe)));
  });
  //
  // #endregion Add Recipe buttons to DOM
  //

  const credit = document.createElement('p');
  quickCrafter.append(credit);
  credit.style.float = 'right';
  credit.style.marginTop = '-20px';
  credit.style.marginRight = '5px';
  credit.innerHTML = `Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v<a href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">${pkg.version}</a>`;

  // Persist selected recipe
  if (STORE.currentCraft) {
    document
      .getElementById(`recipe_button-${STORE.currentCraft.replace(/ /g, '_')}`)
      .dispatchEvent(new MouseEvent('click'));
  }
})();
