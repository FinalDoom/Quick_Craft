import React from 'react';
import {IsCraftingContext} from '../../../context/is-crafting';
import {Book} from '../../../generated/recipe_info';
import './recipe-button.scss';
import SelectableButton from './selectable-button';

export default function RecipeButton(
  props: {book: Book; name: string} & Omit<Parameters<typeof SelectableButton>[0], 'classNameBase' | 'children'>,
) {
  const base = 'recipes__recipe';

  return (
    <IsCraftingContext.Consumer>
      {({isCrafting}) => (
        <SelectableButton
          {...props}
          disabled={isCrafting}
          additionalClassNames={base + '--book-' + props.book.toLocaleLowerCase().replace(/ /g, '-')}
          classNameBase={base}
          selected={props.selected}
          children={props.name}
        />
      )}
    </IsCraftingContext.Consumer>
  );
}
