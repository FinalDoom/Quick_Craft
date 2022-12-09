import clsx from 'clsx';
import React, {HTMLAttributes, HTMLProps} from 'react';
import {SelectedTypesContext} from '../../../context/options';
import {RECIPE_TYPES} from '../../../generated/recipe_info';
import {BookButton} from '../../button';
import './type-selector.scss';

export default function TypeSelector(props: {} & HTMLAttributes<HTMLDivElement> & HTMLProps<HTMLDivElement>) {
  const base = 'quick-crafter-type-selector';

  return (
    <SelectedTypesContext.Consumer>
      {({selectedTypes, setSelectedTypes}) => (
        <>
          <h4>Types</h4>
          <div {...props} className={clsx(props.className, base + '__book-buttons')}>
            {RECIPE_TYPES.map((name) => (
              <BookButton
                key={name}
                book={name}
                classNameBase={base + '__books-button'}
                selectedChanged={(nowSelected) => {
                  const currentTypes = new Set(selectedTypes);
                  if (nowSelected) {
                    currentTypes.add(name);
                  } else {
                    currentTypes.delete(name);
                  }
                  setSelectedTypes([...currentTypes]);
                }}
                selected={selectedTypes.includes(name)}
              />
            ))}
          </div>
        </>
      )}
    </SelectedTypesContext.Consumer>
  );
}
