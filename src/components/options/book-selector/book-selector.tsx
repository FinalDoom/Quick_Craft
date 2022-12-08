import React from 'react';
import {SelectedBooksContext} from '../../../context/options';
import {BOOKS} from '../../../generated/recipe_info';
import {BookButton, Button} from '../../button';
import './book-selector.scss';

export default function BookSelector() {
  const base = 'quick-crafter-book-selector';

  return (
    <SelectedBooksContext.Consumer>
      {({selectedBooks, setSelectedBooks}) => (
        <div>
          <Button classNameBase={base + '__books-hide'} onClick={() => setSelectedBooks([])}>
            Hide all
          </Button>
          <Button classNameBase={base + '__books-show'} onClick={() => setSelectedBooks(BOOKS)}>
            Show all
          </Button>
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
      )}
    </SelectedBooksContext.Consumer>
  );
}
