import React, {createContext} from 'react';
import {Book, BOOKS, CATEGORIES, Category, RecipeType, RECIPE_TYPES} from '../generated/recipe_info';

export const ExtraSpaceContext = createContext<{
  showExtraSpace: boolean;
  setShowExtraSpace: React.Dispatch<React.SetStateAction<boolean>>;
}>({showExtraSpace: false, setShowExtraSpace: () => {}});

export const NeedHaveSwitchContext = createContext<{
  switchNeedHave: boolean;
  setSwitchNeedHave: React.Dispatch<React.SetStateAction<boolean>>;
}>({switchNeedHave: false, setSwitchNeedHave: () => {}});

export const SelectedBooksContext = createContext<{
  selectedBooks: Book[];
  setSelectedBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}>({selectedBooks: BOOKS as Book[], setSelectedBooks: () => {}});

export const SelectedTypesContext = createContext<{
  selectedTypes: RecipeType[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<RecipeType[]>>;
}>({selectedTypes: RECIPE_TYPES as RecipeType[], setSelectedTypes: () => {}});

export const SelectedCategoriesContext = createContext<{
  selectedCategories: Category[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}>({selectedCategories: CATEGORIES, setSelectedCategories: () => {}});
