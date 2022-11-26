import React from 'react';
import {Book} from '../../../generated/recipe_info';
import './book-button.scss';
import SelectableButton from './selectable-button';

export default function BookButton(
  props: {book: Book} & Omit<Parameters<typeof SelectableButton>[0], 'classNameBase' | 'text'>,
) {
  const base = 'crafting-panel-filters__books-button';

  return (
    <SelectableButton
      {...props}
      additionalClassNames={base + '--book-' + props.book.toLocaleLowerCase().replace(/ /g, '-')}
      classNameBase={base}
      text={props.book}
    />
  );
}
