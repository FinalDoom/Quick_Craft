import clsx from 'clsx';
import React from 'react';
import {Book} from '../../../generated/recipe_info';
import './book-button.scss';
import ToggleableButton from './toggleable-button';

export default function BookButton(
  props: {
    book: Book;
    classNameBase?: string;
  } & Omit<Parameters<typeof ToggleableButton>[0], 'classNameBase' | 'children'>,
) {
  const {book, classNameBase, additionalClassNames, ...otherProps} = props;
  const base = classNameBase || 'crafting-panel-filters__books-button';

  return (
    <ToggleableButton
      {...otherProps}
      additionalClassNames={clsx(
        additionalClassNames,
        base + '--book-' + props.book.toLocaleLowerCase().replace(/ /g, '-'),
      )}
      classNameBase={base}
      children={props.book}
    />
  );
}
