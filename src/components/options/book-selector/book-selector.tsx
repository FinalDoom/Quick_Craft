import React, {HTMLAttributes, HTMLProps} from 'react';
import {SelectedBooksContext} from '../../../context/options';
import {BOOKS} from '../../../generated/recipe_info';
import {BookButton, Button} from '../../button';
import './book-selector.scss';

export default function BookSelector(props: {} & HTMLAttributes<HTMLDivElement> & HTMLProps<HTMLDivElement>) {
  const base = 'quick-crafter-book-selector';

  return (
    <SelectedBooksContext.Consumer>
      {({selectedBooks, setSelectedBooks}) => (
        <>
          <h4>Books</h4>
          <div {...props}>
            <div className={base + '__bulk-actions'}>
              <Button classNameBase={base + '__books-hide'} onClick={() => setSelectedBooks([])}>
                Hide all
              </Button>
              <Button classNameBase={base + '__books-show'} onClick={() => setSelectedBooks(BOOKS)}>
                Show all
              </Button>
            </div>
            <div className={base + '__book-buttons'}>
              {BOOKS.map((name) => (
                <BookButton
                  key={name}
                  book={name}
                  classNameBase={base + '__books-button'}
                  selectedChanged={(nowSelected) => {
                    const currentBooks = new Set(selectedBooks);
                    // Hide/show book sections
                    if (nowSelected) {
                      currentBooks.add(name);
                    } else {
                      currentBooks.delete(name);
                    }
                    setSelectedBooks([...currentBooks]);
                  }}
                  selected={selectedBooks.includes(name)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </SelectedBooksContext.Consumer>
  );
}
