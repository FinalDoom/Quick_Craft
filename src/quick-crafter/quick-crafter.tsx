import React, {ChangeEvent} from 'react';
import lunr, {Token} from 'lunr';
import {Book, BOOKS, IdentifiedIngredient, ingredients, RecipeInfo, recipeInfo} from '../generated/recipe_info';
import {GM_KEYS} from '../store/store';
import RecipeButton from '../button/variants/recipe-button';
import BookButton from '../button/variants/book-button';
import Button from '../button/button';
import Checkbox from '../checkbox/checkbox';
import CraftingSubmenu from '../crafting-submenu/crafting-submenu';
import SearchBox from '../search-box/search-box';
import Log from '../log/log';
import {getGMStorageValue, setGMStorageValue} from '../helpers/gm-storage-helper';
import Api from '../api/api';
import Credits from '../credits/credits';

interface Props {
  api: Api;
  log: Log;
}
interface State {
  currentCraft?: number;
  extraSpace: boolean;
  filteredRecipes: ReadonlyArray<number> | ReadonlyArray<ReadonlyArray<number>>;
  inventory: Map<number, number>;
  loadingStore?: boolean;
  loadingApi?: boolean;
  loadingInventory?: boolean;
  loadingEquipment?: boolean;
  search: string;
  searchIngredients: boolean;
  switchNeedHave: boolean;
  selectedBooks: ReadonlySet<Book>;
}

const bookIndexName: keyof RecipeInfo = 'book';
const categoryIndexName: keyof RecipeInfo = 'category';
const ingredientsIndexName = 'ingredients';
const nameIndexName: keyof RecipeInfo = 'name';
const resultIndexName = 'result';
const typeIndexName: keyof RecipeInfo = 'type';

const normalizer = (token: Token): null | Token | Token[] =>
  token.update((str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, ''));
lunr.Pipeline.registerFunction(normalizer, 'normalizer');

const recipeIndex = lunr(function () {
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

export default class QuickCrafter extends React.Component<Props, State> {
  craftingSubmenu = React.createRef<CraftingSubmenu>();
  recipeButtons: Array<JSX.Element>;

  constructor(props: Props) {
    super(props);

    this.state = {
      currentCraft: undefined,
      extraSpace: false,
      filteredRecipes: this.getSortedRecipes(recipeInfo.map(({id}) => id)),
      inventory: new Map<number, number>(),
      loadingApi: false,
      loadingEquipment: false,
      loadingInventory: true,
      loadingStore: true,
      search: '',
      searchIngredients: true,
      selectedBooks: new Set(BOOKS),
      switchNeedHave: false,
    };

    this.recipeButtons = recipeInfo.map((recipe) => (
      <RecipeButton
        key={recipe.id}
        book={recipe.book}
        clickCallback={() => this.setCurrentCraft(recipe.id)}
        name={recipe.name}
        selected={this.state.currentCraft === recipe.id}
      />
    ));

    // Fetch async state
    Promise.all([this.props.api.getInventoryCounts()]).then(([inventory]) => {
      this.setState({inventory: inventory, loadingInventory: false});
    });
    Promise.all([
      getGMStorageValue(GM_KEYS.currentCraft, this.state.currentCraft),
      getGMStorageValue(GM_KEYS.extraSpace, this.state.extraSpace),
      getGMStorageValue(GM_KEYS.search, this.state.search),
      getGMStorageValue(GM_KEYS.searchIngredients, this.state.searchIngredients),
      getGMStorageValue(GM_KEYS.selectedBooks, ['Potions', 'Food', 'Material Bars']),
      getGMStorageValue(GM_KEYS.switchNeedHave, this.state.switchNeedHave),
    ]).then(([currentCraft, extraSpace, search, searchIngredients, selectedBooks, switchNeedHave]) => {
      this.setState({
        currentCraft: currentCraft,
        extraSpace: extraSpace,
        loadingStore: false,
        search: search,
        searchIngredients: searchIngredients,
        selectedBooks: new Set(selectedBooks),
        switchNeedHave: switchNeedHave,
      });
    });
  }

  // TODO how to skip copying these types?
  setState<K extends keyof State>(
    state:
      | ((prevState: Readonly<State>, props: Readonly<Props>) => Pick<State, K> | State | null)
      | (Pick<State, K> | State | null),
    callback?: () => void,
  ) {
    if (typeof state === 'function') {
      state = state(this.state, this.props);
    }
    if (this.recipeFiltersChanged(state)) {
      try {
        const filteredRecipes = this.getFilteredRecipes(state);
        state = {...state, filteredRecipes: filteredRecipes};
      } catch (err) {
        if (!('name' in err && err.name === 'QueryParseError')) throw err;
      }
    }
    super.setState(state, callback);
  }

  recipeFiltersChanged<K extends keyof State>(state: Pick<State, K> | State | null) {
    return (
      ('search' in state && state.search !== this.state.search) ||
      ('searchIngredients' in state &&
        state.searchIngredients !== this.state.searchIngredients &&
        (state.search || this.state.search)) ||
      ('selectedBooks' in state &&
        (state.selectedBooks.size !== this.state.selectedBooks.size ||
          !Array.prototype.every.call(state.selectedBooks, (book: Book) => this.state.selectedBooks.has(book))))
    );
  }

  getFilteredRecipes<K extends keyof State>(state: Pick<State, K> | State | null) {
    const selectedBooks = 'selectedBooks' in state ? state.selectedBooks : this.state.selectedBooks;
    const search = 'search' in state ? state.search : this.state.search;
    const searchIngredients = 'searchIngredients' in state ? state.searchIngredients : this.state.searchIngredients;

    const bookMatches =
      selectedBooks.size === 0
        ? []
        : recipeIndex
            .search([...selectedBooks].map((book) => bookIndexName + ':' + book.split(/\s+/)[0]).join(' '))
            .map((result) => Number(result.ref));

    let filteredRecipes: number[];
    if (search.length === 0) filteredRecipes = Array.from(bookMatches);
    else {
      const searchString = search
        .split(/\s+/)
        .map((token) => {
          if (/:/.test(token)) return token;
          return token.replace(
            /^([-+]?)(.*)$/,
            `$1${nameIndexName}:$2 $1${resultIndexName}:$2` +
              (searchIngredients ? ` $1${ingredientsIndexName}:$2` : ''),
          );
        })
        .join(' ');
      const results = new Set(recipeIndex.search(searchString).map((result) => Number(result.ref)));

      filteredRecipes = bookMatches.filter((id: number) => results.has(id));
    }
    return this.getSortedRecipes(filteredRecipes);
  }

  getSortedRecipes(filteredRecipes: number[]) {
    // Sort however
    filteredRecipes.sort((a, b) => {
      const recipeA = recipeInfo[a];
      const recipeB = recipeInfo[b];
      return recipeA.book === recipeB.book
        ? recipeA.id - recipeB.id
        : BOOKS.indexOf(recipeA.book) - BOOKS.indexOf(recipeB.book);
    });
    // if book sort
    let currentBook: Book;
    const reduced = filteredRecipes.reduce((arr, id) => {
      if (currentBook !== recipeInfo[id].book) {
        arr.push([]);
        currentBook = recipeInfo[id].book;
      }
      arr[arr.length - 1].push(id);
      return arr;
    }, [] as number[][]);
    return reduced;
  }

  setCurrentCraft(id?: number) {
    if (!(this.craftingSubmenu.current && this.craftingSubmenu.current.state.isCrafting)) {
      this.setState({currentCraft: id}, () => setGMStorageValue(GM_KEYS.currentCraft, id));
    }
  }

  setExtraSpace(extraSpace: boolean) {
    this.setState({extraSpace: extraSpace}, () => setGMStorageValue(GM_KEYS.extraSpace, extraSpace));
  }

  setSearch(search: string) {
    this.setState({search: search}, () => setGMStorageValue(GM_KEYS.search, search));
  }

  setSearchIngredients(include: boolean) {
    this.setState({searchIngredients: include}, () => setGMStorageValue(GM_KEYS.searchIngredients, include));
  }

  setSelectedBooks(books: Set<Book>) {
    this.setState({selectedBooks: books}, () => setGMStorageValue(GM_KEYS.selectedBooks, Array.from(books)));
  }

  setSwitchNeedHave(switchNeedHave: boolean) {
    this.setState({switchNeedHave: switchNeedHave}, () => setGMStorageValue(GM_KEYS.switchNeedHave, switchNeedHave));
  }

  render() {
    return (
      <React.StrictMode>
        {this.state.currentCraft !== undefined && (
          <CraftingSubmenu
            ref={this.craftingSubmenu}
            inventory={this.state.inventory}
            recipe={recipeInfo[this.state.currentCraft]}
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
            clickCallback={() => this.setSelectedBooks(new Set())}
            text="Hide all"
          />
          <Button
            variant="click"
            classNameBase="crafting-panel-filters__books-show"
            clickCallback={() => this.setSelectedBooks(new Set(BOOKS))}
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
                const selectedBooks = new Set(this.state.selectedBooks);
                // Hide book sections
                if (selectedBooks.has(name)) {
                  selectedBooks.delete(name);
                } else {
                  selectedBooks.add(name);
                }
                this.setSelectedBooks(selectedBooks);
              }}
              selected={this.state.selectedBooks.has(name)}
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
          {this.state.filteredRecipes.map((idOrArray: number | readonly number[]) => {
            if (Array.isArray(idOrArray)) {
              return (
                <div key={recipeInfo[idOrArray[0]].book} className={'recipe-buttons__book-section'}>
                  {idOrArray.map((id) => this.recipeButtons[id])}
                </div>
              );
            } else {
              return this.recipeButtons[idOrArray as number];
            }
          })}
        </div>
        {
          //
          // #endregion Add Recipe buttons to DOM
          //
        }
        <Credits />
      </React.StrictMode>
    );
  }
}
