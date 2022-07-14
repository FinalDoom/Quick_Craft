'use strict';

import './style/main.scss';
import pkg from '../package.json';

import React, {ChangeEvent, useState} from 'react';
import {createRoot} from 'react-dom/client';
import ReactTestUtils from 'react-dom/test-utils';
import {GazelleApi} from './api/api';
import {BOOKS, GeneratedRecipe, ingredients, recipes} from './generated/recipe_info';
import {ConsoleLog} from './log/log';
import {Inventory} from './models/inventory';
import {QuickCraftStore} from './store/store';
import RecipeButton from './button/variants/recipe-button';
import BookButton from './button/variants/book-button';
import Button from './button/button';
import Checkbox from './checkbox/checkbox';
import CraftingSubmenu from './crafting-submenu/crafting-submenu';

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

  //
  // #region Create Recipe Book and Recipe buttons
  //

  const [currentCraft, setCurrentCraftState] = useState(STORE.currentCraft);
  const setCurrentCraft = (name: string) => {
    STORE.currentCraft = name;
    setCurrentCraftState(name);
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
      <CraftingSubmenu
        inventory={INVENTORY}
        recipe={recipes.find(({itemId, name}) => name === currentCraft || ingredients[itemId].name === currentCraft)}
        switchNeedHave={STORE.switchNeedHave}
      />
      <div id="current_craft_box">
        <p>
          Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better
          experience.
        </p>
        <Button
          variant="click"
          classNameBase="crafting-panel-actions__clear-craft-button"
          clickCallback={() => setCurrentCraft(undefined)}
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
            {recipes
              .filter(({book}) => book === bookName)
              .map((recipe) => {
                const name = recipe.name || ingredients[recipe.itemId].name;

                return (
                  <RecipeButton
                    key={name}
                    book={recipe.book}
                    clickCallback={() => {
                      setCurrentCraft(name);
                      document
                        .querySelector('.recipes__recipe--selected')
                        ?.classList.remove('recipes__recipe--selected');
                    }}
                    name={name}
                    store={STORE}
                  />
                );
              })}
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
          {/* <GoMarkGithub /> */}
        </a>
      </p>
    </React.Fragment>,
  );
})();
