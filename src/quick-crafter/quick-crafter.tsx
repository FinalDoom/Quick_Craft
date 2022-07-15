import pkg from '../../package.json';

import React, {ChangeEvent} from 'react';
import {Book, BOOKS, ingredients, recipes} from '../generated/recipe_info';
import {GM_KEYS} from '../store/store';
import RecipeButton from '../button/variants/recipe-button';
import BookButton from '../button/variants/book-button';
import Button from '../button/button';
import Checkbox from '../checkbox/checkbox';
import CraftingSubmenu from '../crafting-submenu/crafting-submenu';
import {Inventory} from '../models/inventory';
import SearchBox from '../search-box/search-box';
import Log from '../log/log';
import tokenize, {Token} from '../search-text-tokenizer/search-text-tokenizer';
import {getGMStorageValue, setGMStorageValue} from '../helpers/gm-storage-helper';

interface Props {
  inventory: Inventory;
  log: Log;
}
interface State {
  currentCraft: string;
  extraSpace: boolean;
  loadingStore?: boolean;
  loadingApi?: boolean;
  loadingInventory?: boolean;
  loadingEquipment?: boolean;
  search: string;
  searchIngredients: boolean;
  searchTokens: Array<Token>;
  switchNeedHave: boolean;
  selectedBooks: Book[];
}

export default class QuickCrafter extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentCraft: undefined,
      extraSpace: false,
      loadingApi: false,
      loadingEquipment: false,
      loadingInventory: false,
      loadingStore: true,
      search: '',
      searchIngredients: true,
      searchTokens: [],
      switchNeedHave: false,
      selectedBooks: ['Potions', 'Food', 'Material Bars'],
    };

    // Fetch async state
    Promise.all([
      getGMStorageValue(GM_KEYS.currentCraft, this.state.currentCraft),
      getGMStorageValue(GM_KEYS.extraSpace, this.state.extraSpace),
      getGMStorageValue(GM_KEYS.search, this.state.search),
      getGMStorageValue(GM_KEYS.searchIngredients, this.state.searchIngredients),
      getGMStorageValue(GM_KEYS.selectedBooks, this.state.selectedBooks),
      getGMStorageValue(GM_KEYS.switchNeedHave, this.state.switchNeedHave),
    ]).then(([currentCraft, extraSpace, search, searchIngredients, selectedBooks, switchNeedHave]) => {
      this.setState({
        currentCraft: currentCraft,
        extraSpace: extraSpace,
        loadingStore: false,
        search: search,
        searchIngredients: searchIngredients,
        searchTokens: tokenize(search),
        selectedBooks: selectedBooks,
        switchNeedHave: switchNeedHave,
      });
    });
  }

  setCurrentCraft(craft?: string) {
    this.setState({currentCraft: craft}, () => setGMStorageValue(GM_KEYS.currentCraft, craft));
  }

  setExtraSpace(extraSpace: boolean) {
    this.setState({extraSpace: extraSpace}, () => setGMStorageValue(GM_KEYS.extraSpace, extraSpace));
  }

  setSearch(search: string) {
    this.setState({search: search, searchTokens: tokenize(search)}, () => setGMStorageValue(GM_KEYS.search, search));
  }

  setSearchIngredients(include: boolean) {
    this.setState({searchIngredients: include}, () => setGMStorageValue(GM_KEYS.searchIngredients, include));
  }

  setSelectedBooks(books: Book[]) {
    this.setState({selectedBooks: books}, () => setGMStorageValue(GM_KEYS.selectedBooks, books));
  }

  setSwitchNeedHave(switchNeedHave: boolean) {
    this.setState({switchNeedHave: switchNeedHave}, () => setGMStorageValue(GM_KEYS.switchNeedHave, switchNeedHave));
  }

  render() {
    return (
      <React.StrictMode>
        {this.state.currentCraft && (
          <CraftingSubmenu
            inventory={this.props.inventory}
            recipe={recipes.find(
              ({itemId, name}) =>
                name === this.state.currentCraft || ingredients[itemId].name === this.state.currentCraft,
            )}
            switchNeedHave={this.state.switchNeedHave}
          />
        )}
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
            clickCallback={() => this.setSelectedBooks([])}
            text="Hide all"
          />
          <Button
            variant="click"
            classNameBase="crafting-panel-filters__books-show"
            clickCallback={() => this.setSelectedBooks(BOOKS)}
            text="Show all"
          />
          <Checkbox
            className="quick_craft_button"
            checked={this.state.extraSpace}
            onChange={async (event: ChangeEvent<HTMLInputElement>) => this.setExtraSpace(event.target.checked)}
            suffix="Blank line between books"
          />
          <Checkbox
            title="Switches between needed/have and have/needed"
            checked={this.state.switchNeedHave}
            onChange={(event: ChangeEvent<HTMLInputElement>) => this.setSwitchNeedHave(event.target.checked)}
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
              clickCallback={() => {
                // Hide book sections
                if (this.state.selectedBooks.includes(name)) {
                  this.setSelectedBooks(this.state.selectedBooks.filter((value) => value !== name));
                } else {
                  this.setSelectedBooks(this.state.selectedBooks.concat(name));
                }
              }}
              selected={this.state.selectedBooks.includes(name)}
            />
          ))}
        </div>
        {
          //
          // #endregion Add "Recipe Book" on/off buttons to DOM
          //
        }
        <div className="crafting-panel-search">
          <SearchBox changeSearch={(search: string) => this.setSearch(search)} initialSearch={this.state.search} />
          <Checkbox
            checked={this.state.searchIngredients}
            className="crafating-panel-search__include-ingredients"
            prefix="Include ingredients"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => this.setSearchIngredients(event.target.checked)}
          />
        </div>
        {
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
                (this.state.selectedBooks.includes(bookName) ? '' : ' recipe-buttons__book-section--disabled')
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
