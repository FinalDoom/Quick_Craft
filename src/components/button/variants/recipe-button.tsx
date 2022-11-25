import './recipe-button.scss';
import React from 'react';
import {Book} from '../../../generated/recipe_info';
import SelectableButton from './selectable-button';

export default function RecipeButton(props: {book: Book; clickCallback: () => void; name: string; selected: boolean}) {
  const base = 'recipes__recipe';

  return (
    <SelectableButton
      additionalClassNames={base + '--book-' + props.book.toLocaleLowerCase().replace(/ /g, '-')}
      classNameBase={base}
      clickCallback={props.clickCallback}
      selected={props.selected}
      text={props.name}
    />
  );
}
