'use strict';

import './style/main.scss';
import pkg from '../package.json';

import React, {ChangeEvent} from 'react';
import {createRoot} from 'react-dom/client';
import ReactTestUtils from 'react-dom/test-utils';
import {GazelleApi} from './api/api';
import {BOOKS, GeneratedRecipe, ingredients, recipes} from './generated/recipe_info';
import {take_craft} from './helpers/crafter';
import IngredientLine, {IngredientTemp} from './ingredient-line/ingredient-line';
import {ConsoleLog} from './log/log';
import {Inventory} from './models/inventory';
import {QuickCraftStore} from './store/store';
import CountingSet from './util/counting-set';
import RecipeButton from './button/variants/recipe-button';
import BookButton from './button/variants/book-button';
import Button from './button/button';
import MaxCraftButton from './button/variants/max-craft-button';
import Checkbox from './checkbox/checkbox';

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

  let craftingSubmenu: HTMLDivElement;
  let isCrafting = false;

  function close_crafting_submenu() {
    if (craftingSubmenu) {
      craftingSubmenu.remove();
      STORE.currentCraft = craftingSubmenu = undefined;
    }
  }

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
        name: ingredients[Number(id)].name,
        id: Number(id),
        qty: perCraft,
        onHand: onHand,
      });
    }

    const createCraftingActions = (available: number) => {
      if (available <= 0) {
        return '';
      }

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

        let count = Number(document.querySelector<HTMLSelectElement>('.crafting-panel-actions__craft-number').value);

        await (async () => {
          for (let i = 0; i < count; i++) {
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

      return (
        <div className="crafting-panel-actions">
          <select className="crafting-panel-actions__craft-number">
            {Array(currentCraft.available)
              .fill(undefined)
              .map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
          </select>
          <Button
            variant="click"
            classNameBase="crafting-panel-actions__craft-button"
            clickCallback={doCraft}
            text="Craft"
          />
          <MaxCraftButton
            executeCraft={doCraft}
            setMaxCraft={() =>
              (document.querySelector<HTMLSelectElement>('.crafting-panel-actions__craft-number').value = String(
                currentCraft.available,
              ))
            }
          />
        </div>
      );
    };

    close_crafting_submenu();
    STORE.currentCraft = recipeName;

    const createIngredientLine = (ingredient: IngredientTemp, maxWithPurchase: number) => {
      const togglePurchasable = () => {
        if (purchasable.includes(ingredient.name)) {
          delete purchasable[purchasable.indexOf(ingredient.name)];
          purchasable = purchasable.flat();
        } else if (purchasable.length < currentCraft.ingredients.length - 1) purchasable.push(ingredient.name);
        close_crafting_submenu();
        open_crafting_submenu(recipe, purchasable);
      };

      return (
        <IngredientLine
          key={ingredient.id}
          click={togglePurchasable}
          ingredient={ingredient}
          maxCraftableWithPurchase={maxWithPurchase}
          purchasable={purchasable.includes(ingredient.name)}
          store={STORE}
        />
      );
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

    const root = createRoot(craftingSubmenu);
    root.render(
      <React.Fragment>
        <div className="crafting-panel__title">
          {ingredients[recipe.itemId].name}
          {INVENTORY.itemCount(String(recipe.itemId)) > 0
            ? ` (${INVENTORY.itemCount(String(recipe.itemId))} in inventory)`
            : ''}
        </div>
        <div className="crafting-panel-info__ingredients-header">Ingredients:</div>
        <div className="crafting-panel-info__ingredients-column">
          {currentCraft.ingredients.map((ingredient) => createIngredientLine(ingredient, maxWithPurchase))}
        </div>
        <span className="crafting-panel-info__ingredients-max">
          Max available craft(s): {currentCraft.available}
          {currentCraft.available !== maxWithPurchase ? (
            <span title="Max possible if additional ingredients are purchased">({maxWithPurchase})</span>
          ) : (
            ''
          )}
          <sup>
            <a title="Click ingredients to mark as purchasable and calculate +purchase needed and max possible crafted.">
              ?
            </a>
          </sup>
        </span>
        {createCraftingActions(currentCraft.available)}
      </React.Fragment>,
    );
  }
  //
  // #region Create Recipe Book and Recipe buttons
  //

  //
  // Creates a Recipe button.
  //
  const createRecipeButton = (recipe: GeneratedRecipe) => {
    const name = recipe.name || ingredients[recipe.itemId].name;

    return (
      <RecipeButton
        key={name}
        book={recipe.book}
        clickCallback={() => {
          STORE.currentCraft = name;
          document.querySelector('.recipes__recipe--selected')?.classList.remove('recipes__recipe--selected');
          open_crafting_submenu(recipe, []);
        }}
        name={name}
        store={STORE}
      />
    );
  };

  const clearDiv = document.createElement('div');
  clearDiv.classList.add('crafting-clear');
  document.getElementById('crafting_recipes').before(clearDiv);

  const quickCrafter = document.createElement('div');
  document.getElementById('crafting_recipes').before(quickCrafter);
  quickCrafter.id = 'quick-crafter';
  const root = createRoot(quickCrafter);

  root.render(
    <React.Fragment>
      <div id="current_craft_box">
        <p>
          Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better
          experience.
        </p>
        <Button
          variant="click"
          classNameBase="crafting-panel-actions__clear-craft-button"
          clickCallback={close_crafting_submenu}
          text="Clear"
        />
      </div>
      <div className="crafting-panel-actions__craft-row">
        <span>Click on the buttons below to show or hide crafting categories - </span>
        <Button
          variant="click"
          classNameBase="crafting-panel-filters__books-hide"
          clickCallback={() => {
            BOOKS.forEach((book) => {
              if (STORE.selectedBooks.includes(book)) {
                ReactTestUtils.Simulate.click(
                  document.querySelector<HTMLButtonElement>(
                    '.crafting-panel-filters__books-button--book-' + book.toLocaleLowerCase().replace(/ /g, '-'),
                  ),
                );
              }
            });
          }}
          text="Hide all"
        />
        <Button
          variant="click"
          classNameBase="crafting-panel-filters__books-show"
          clickCallback={() => {
            BOOKS.forEach((book) => {
              if (!STORE.selectedBooks.includes(book)) {
                ReactTestUtils.Simulate.click(
                  document.querySelector<HTMLButtonElement>(
                    '.crafting-panel-filters__books-button--book-' + book.toLocaleLowerCase().replace(/ /g, '-'),
                  ),
                );
              }
            });
          }}
          text="Show all"
        />
        <Checkbox
          className="quick_craft_button"
          checked={await GM.getValue('SEG', false)}
          onChange={async (event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.checked) {
              document.querySelector<HTMLDivElement>('.recipe-buttons').classList.add('recipe-buttons--extra-space');
            } else {
              document.querySelector<HTMLDivElement>('.recipe-buttons').classList.remove('recipe-buttons--extra-space');
            }
            await GM.setValue('SEG', event.target.checked);
          }}
          suffix="Blank line between books"
        />
        <Checkbox
          title="Switches between needed/have and have/needed"
          checked={STORE.switchNeedHave}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            Array.from(document.querySelectorAll<HTMLDivElement>('.crafting-panel-info__ingredient-row')).forEach(
              (elem) => {
                if (event.target.checked) {
                  elem.classList.add('crafting-panel-info__ingredient-quantity--swapped');
                } else {
                  elem.classList.remove('crafting-panel-info__ingredient-quantity--swapped');
                }
              },
            );
            STORE.switchNeedHave = event.target.checked;
          }}
          suffix="NH switch"
        />
      </div>
      {
        //
        // #region Add "Recipe Book" on/off buttons to DOM
        //
      }
      <div className="crafting-panel-filters__books-row">
        {BOOKS.map((name) => (
          <BookButton
            key={name}
            book={name}
            clickCallback={(selected: boolean) => {
              const selectedBooks = STORE.selectedBooks;
              // Hide book sections
              if (selected) {
                document
                  .getElementById(`recipe-buttons__book-section-${name.replace(/ /g, '_')}`)
                  .classList.remove('recipe-buttons__book-section--disabled');
                selectedBooks.push(name);
              } else {
                document
                  .getElementById(`recipe-buttons__book-section-${name.replace(/ /g, '_')}`)
                  .classList.add('recipe-buttons__book-section--disabled');
                delete selectedBooks[selectedBooks.indexOf(name)];
              }
              STORE.selectedBooks = selectedBooks.flat();
            }}
            defaultSelected={STORE.selectedBooks.includes(name)}
          />
        ))}
      </div>
      {
        //
        // #endregion Add "Recipe Book" on/off buttons to DOM
        //
        //
        // #region Add Recipe buttons to DOM
        //
      }
      <div
        className={
          'recipe-buttons recipe-buttons--book-sort' +
          ((await GM.getValue('SEG', false)) ? ' recipe-buttons--extra-space' : '')
        }
      >
        {BOOKS.map((bookName) => (
          <div
            key={bookName}
            className={
              'recipe-buttons__book-section' +
              (STORE.selectedBooks.includes(bookName) ? '' : ' recipe-buttons__book-section--disabled')
            }
            id={`recipe-buttons__book-section-${bookName.replace(/ /g, '_')}`}
          >
            {recipes.filter(({book}) => book === bookName).map((recipe) => createRecipeButton(recipe))}
          </div>
        ))}
      </div>
      {
        //
        // #endregion Add Recipe buttons to DOM
        //
      }
      <p className="credits">
        Quick Crafter by <a href="/user.php?id=58819">KingKrab23</a> v
        <a target="_blank" href="https://github.com/KingKrab23/Quick_Craft/raw/master/GGn%20Quick%20Crafting.user.js">
          {pkg.version}
        </a>
      </p>
    </React.Fragment>,
  );

  // Persist selected recipe
  window.requestIdleCallback(() => {
    if (STORE.currentCraft) {
      const selectedRecipe = recipes.find(
        ({itemId, name}) => name === STORE.currentCraft || ingredients[itemId].name === STORE.currentCraft,
      );
      open_crafting_submenu(selectedRecipe, []);
    }
  });
})();
