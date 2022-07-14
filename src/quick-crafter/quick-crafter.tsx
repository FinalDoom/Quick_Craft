import pkg from '../../package.json';

import React, {ChangeEvent} from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import {BOOKS, ingredients, recipes} from '../generated/recipe_info';
import Store, {Storable} from '../store/store';
import RecipeButton from '../button/variants/recipe-button';
import BookButton from '../button/variants/book-button';
import Button from '../button/button';
import Checkbox from '../checkbox/checkbox';
import CraftingSubmenu from '../crafting-submenu/crafting-submenu';
import {Inventory} from '../models/inventory';

interface Props {
  extraSpace: boolean;
  inventory: Inventory;
  store: Store;
}
interface State extends Partial<Storable> {
  currentCraft: string;
  extraSpace: boolean;
  loadingStore?: boolean;
  loadingApi?: boolean;
  loadingInventory?: boolean;
  loadingEquipment?: boolean;
}

export default class QuickCrafter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentCraft: this.props.store.currentCraft,
      extraSpace: this.props.extraSpace,
      loadingStore: false,
      loadingApi: false,
      loadingInventory: false,
      loadingEquipment: false,
    };
  }

  setCurrentCraft(craft?: string) {
    this.props.store.currentCraft = craft;
    this.setState({currentCraft: craft});
  }

  async setExtraSpace(extraSpace: boolean) {
    this.setState({extraSpace: extraSpace});
    await GM.setValue('SEG', extraSpace);
  }

  render() {
    return (
      <React.StrictMode>
        <CraftingSubmenu
          inventory={this.props.inventory}
          recipe={recipes.find(
            ({itemId, name}) =>
              name === this.state.currentCraft || ingredients[itemId].name === this.state.currentCraft,
          )}
          switchNeedHave={this.props.store.switchNeedHave}
        />
        <div id="current_craft_box">
          <p>
            Having trouble? Try refreshing if it seems stuck. Turn off this script before manual crafting for a better
            experience.
          </p>
          <Button
            variant="click"
            classNameBase="crafting-panel-actions__clear-craft-button"
            clickCallback={() => this.setCurrentCraft(undefined)}
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
                if (this.props.store.selectedBooks.includes(book)) {
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
                if (!this.props.store.selectedBooks.includes(book)) {
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
            checked={this.state.extraSpace}
            onChange={async (event: ChangeEvent<HTMLInputElement>) => {
              if (event.target.checked) {
                document.querySelector<HTMLDivElement>('.recipe-buttons').classList.add('recipe-buttons--extra-space');
              } else {
                document
                  .querySelector<HTMLDivElement>('.recipe-buttons')
                  .classList.remove('recipe-buttons--extra-space');
              }
              await this.setExtraSpace(event.target.checked);
            }}
            suffix="Blank line between books"
          />
          <Checkbox
            title="Switches between needed/have and have/needed"
            checked={this.props.store.switchNeedHave}
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
              this.props.store.switchNeedHave = event.target.checked;
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
                const selectedBooks = this.props.store.selectedBooks;
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
                this.props.store.selectedBooks = selectedBooks.flat();
              }}
              defaultSelected={this.props.store.selectedBooks.includes(name)}
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
            'recipe-buttons recipe-buttons--book-sort' + (this.state.extraSpace ? ' recipe-buttons--extra-space' : '')
          }
        >
          {BOOKS.map((bookName) => (
            <div
              key={bookName}
              className={
                'recipe-buttons__book-section' +
                (this.props.store.selectedBooks.includes(bookName) ? '' : ' recipe-buttons__book-section--disabled')
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
                      clickCallback={() => this.setCurrentCraft(name)}
                      name={name}
                      selected={this.state.currentCraft === name}
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
          </a>
        </p>
      </React.StrictMode>
    );
  }
}
