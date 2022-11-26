import React from 'react';
import {Book} from '../../../generated/recipe_info';
import './recipe-button.scss';
import SelectableButton from './selectable-button';

export default function RecipeButton(
  props: {book: Book; name: string} & Omit<Parameters<typeof SelectableButton>[0], 'classNameBase' | 'text'>,
) {
  const base = 'recipes__recipe';

  return (
    <SelectableButton
      {...props}
      additionalClassNames={base + '--book-' + props.book.toLocaleLowerCase().replace(/ /g, '-')}
      classNameBase={base}
      selected={props.selected}
      text={props.name}
    />
  );
}
