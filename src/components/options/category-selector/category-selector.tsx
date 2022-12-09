import clsx from 'clsx';
import React, {HTMLAttributes, HTMLProps} from 'react';
import {SelectedCategoriesContext} from '../../../context/options';
import {CATEGORIES} from '../../../generated/recipe_info';
import {BookButton, Button} from '../../button';
import './category-selector.scss';

export default function CategorySelector(props: {} & HTMLAttributes<HTMLDivElement> & HTMLProps<HTMLDivElement>) {
  const base = 'quick-crafter-category-selector';

  return (
    <SelectedCategoriesContext.Consumer>
      {({selectedCategories, setSelectedCategories}) => (
        <>
          <h4>Categories</h4>
          <div {...props}>
            <div className={base + '__bulk-actions'}>
              <Button classNameBase={base + '__books-hide'} onClick={() => setSelectedCategories([])}>
                Hide all
              </Button>
              <Button classNameBase={base + '__books-show'} onClick={() => setSelectedCategories(CATEGORIES)}>
                Show all
              </Button>
            </div>
            <div className={base + '__book-buttons'}>
              {CATEGORIES.map((name, i) => (
                <BookButton
                  key={name}
                  book={name}
                  classNameBase={base + '__books-button'}
                  additionalClassNames={clsx((i > 9 || name.length > 15) && base + '__books-button--wide')}
                  selectedChanged={(nowSelected) => {
                    const currentCategories = new Set(selectedCategories);
                    if (nowSelected) {
                      currentCategories.add(name);
                    } else {
                      currentCategories.delete(name);
                    }
                    setSelectedCategories([...currentCategories]);
                  }}
                  selected={selectedCategories.includes(name)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </SelectedCategoriesContext.Consumer>
  );
}
