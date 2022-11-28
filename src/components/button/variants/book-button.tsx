import React from 'react';
import {Book} from '../../../generated/recipe_info';
import './book-button.scss';
import ToggleableButton from './toggleable-button';

export default function BookButton(
  props: {book: Book} & Omit<Parameters<typeof ToggleableButton>[0], 'classNameBase' | 'text'>,
) {
  const base = 'crafting-panel-filters__books-button';
  const {book, ...otherProps} = props;

  return (
    <ToggleableButton
      {...otherProps}
      additionalClassNames={base + '--book-' + props.book.toLocaleLowerCase().replace(/ /g, '-')}
      classNameBase={base}
      text={props.book}
    />
  );
}
