import React, {createContext} from 'react';
import {Book, BOOKS} from '../generated/recipe_info';

export const ExtraSpaceContext = createContext<{
  showExtraSpace: boolean;
  setShowExtraSpace: React.Dispatch<React.SetStateAction<boolean>>;
}>({showExtraSpace: false, setShowExtraSpace: () => {}});

export const SelectedBooksContext = createContext<{
  selectedBooks: Book[];
  setSelectedBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}>({selectedBooks: BOOKS as Book[], setSelectedBooks: () => {}});

export const NeedHaveSwitchContext = createContext<{
  switchNeedHave: boolean;
  setSwitchNeedHave: React.Dispatch<React.SetStateAction<boolean>>;
}>({switchNeedHave: false, setSwitchNeedHave: () => {}});
