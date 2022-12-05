import clsx from 'clsx';
import React, {useEffect, useState} from 'react';
import Api from '../../api/api';
import {IsCraftingContext} from '../../context/is-crafting';
import {Book, BOOKS, recipeInfo} from '../../generated/recipe_info';
import {useAsyncGMStorage} from '../../helpers/gm-hook';
import {GM_KEYS} from '../../helpers/gm-keys';
import {recipeSearchHelper} from '../../helpers/search';
import {BookButton, Button, RecipeButton} from '../button';
import {Checkbox} from '../checkbox';
import CraftingSubmenu from '../crafting-submenu/crafting-submenu';
import {Credits} from '../credits';
import {SearchBox} from '../search-box';
import './quick-crafter.scss';

function getSortedRecipes(filteredRecipes: number[]) {
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
  const sortedRecipes = filteredRecipes.reduce((arr, id) => {
    if (currentBook !== recipeInfo[id].book) {
      arr.push([]);
      currentBook = recipeInfo[id].book;
    }
    arr[arr.length - 1].push(id);
    return arr;
  }, [] as number[][]);
  return sortedRecipes;
}

export default function QuickCrafter(props: {api: Api}) {
  const [currentCraft, setCurrentCraft] = useAsyncGMStorage<number | undefined>(GM_KEYS.currentCraft, undefined);
  const [isCrafting, setIsCrafting] = useState(false);
  const [extraSpace, setExtraSpace] = useAsyncGMStorage(GM_KEYS.extraSpace, false);
  const [filteredRecipes, setFilteredRecipes] = useState<ReadonlyArray<number> | ReadonlyArray<ReadonlyArray<number>>>(
    getSortedRecipes(recipeInfo.map(({id}) => id)),
  );
  const [inventory, setInventory] = useState(new Map<number, number>());
  const [search, setSearch] = useAsyncGMStorage(GM_KEYS.search, '');
  const [searchIngredients, setSearchIngredients] = useAsyncGMStorage(GM_KEYS.searchIngredients, true);
  const [selectedBooks, setSelectedBooks] = useAsyncGMStorage(GM_KEYS.selectedBooks, new Set(BOOKS));
  const [switchNeedHave, setSwitchNeedHave] = useAsyncGMStorage(GM_KEYS.switchNeedHave, false);

  // Fetch async state
  useEffect(() => {
    props.api.getInventoryCounts().then((inventory) => {
      setInventory(inventory);
    });
  }, []);

  // Update recipes when filters are updated
  useEffect(() => {
    try {
      setFilteredRecipes(
        getSortedRecipes(
          recipeSearchHelper
            .query()
            .inBooks([...selectedBooks])
            .forText(search, searchIngredients)
            .get(),
        ),
      );
    } catch (err) {
      if (!('name' in err && err.name === 'QueryParseError')) throw err;
    }
  }, [search, searchIngredients, selectedBooks]);

  // Build all the recipe buttons
  const recipeButtons = recipeInfo.map((recipe) => (
    <RecipeButton
      key={recipe.id}
      book={recipe.book}
      onClick={() => setCurrentCraft(recipe.id)}
      name={recipe.name}
      selected={currentCraft === recipe.id}
    />
  ));

  return (
    <React.StrictMode>
      <IsCraftingContext.Provider value={{isCrafting, setIsCrafting}}>
        {currentCraft !== undefined && ( // 0 is a valid currentCraft
          <>
            <CraftingSubmenu inventory={inventory} recipe={recipeInfo[currentCraft]} switchNeedHave={switchNeedHave} />
            <Button
              disabled={isCrafting}
              classNameBase="crafting-panel-actions__clear-craft-button"
              onClick={() => setCurrentCraft(undefined)}
              text="Clear"
            />
          </>
        )}
        <div className="crafting-panel-actions__craft-row">
          <span>Click on the buttons below to show or hide crafting categories - </span>
          <Button
            classNameBase="crafting-panel-filters__books-hide"
            onClick={() => setSelectedBooks(new Set())}
            text="Hide all"
          />
          <Button
            classNameBase="crafting-panel-filters__books-show"
            onClick={() => setSelectedBooks(new Set(BOOKS))}
            text="Show all"
          />
          <Checkbox
            checked={extraSpace}
            onChange={(event) => setExtraSpace(event.target.checked)}
            suffix="Blank line between books"
          />
          <Checkbox
            title="Switches between needed/have and have/needed"
            checked={switchNeedHave}
            onChange={(event) => setSwitchNeedHave(event.target.checked)}
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
              selectedChanged={(nowSelected) => {
                const currentBooks = new Set(selectedBooks);
                // Hide/show book sections
                if (nowSelected) {
                  currentBooks.add(name);
                } else {
                  currentBooks.delete(name);
                }
                setSelectedBooks(currentBooks);
              }}
              selected={selectedBooks.has(name)}
            />
          ))}
        </div>
        {
          //
          // #endregion Add "Recipe Book" on/off buttons to DOM
          //
        }
        <div className="crafting-panel-search">
          <SearchBox changeSearch={setSearch} initialSearch={search} />
          <Checkbox
            checked={searchIngredients}
            prefix="Include ingredients"
            onChange={(event) => setSearchIngredients(event.target.checked)}
          />
        </div>
        {
          //
          // #region Add Recipe buttons to DOM
          //
        }
        <div className={clsx('recipe-buttons recipe-buttons--book-sort', extraSpace && 'recipe-buttons--extra-space')}>
          {filteredRecipes.map((idOrArray: number | readonly number[]) => {
            if (Array.isArray(idOrArray)) {
              return (
                <div key={recipeInfo[idOrArray[0]].book} className="recipe-buttons__book-section">
                  {idOrArray.map((id) => recipeButtons[id])}
                </div>
              );
            } else {
              return recipeButtons[idOrArray as number];
            }
          })}
        </div>
        {
          //
          // #endregion Add Recipe buttons to DOM
          //
        }
        <Credits />
      </IsCraftingContext.Provider>
    </React.StrictMode>
  );
}
