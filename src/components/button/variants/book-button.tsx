import './book-button.scss';
import React from 'react';
import {Book} from '../../../generated/recipe_info';
import SelectableButton from './selectable-button';

export default function BookButton(props: {book: Book; clickCallback: () => void; selected: boolean}) {
  const base = 'crafting-panel-filters__books-button';

  return (
    <SelectableButton
      additionalClassNames={base + '--book-' + props.book.toLocaleLowerCase().replace(/ /g, '-')}
      classNameBase={base}
      clickCallback={props.clickCallback}
      selected={props.selected}
      text={props.book}
    />
  );
}
