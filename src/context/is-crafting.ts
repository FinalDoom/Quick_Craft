import React, {createContext} from 'react';

export const IsCraftingContext = createContext<{
  isCrafting: boolean;
  setIsCrafting: React.Dispatch<React.SetStateAction<boolean>>;
}>({isCrafting: undefined, setIsCrafting: () => {}});
