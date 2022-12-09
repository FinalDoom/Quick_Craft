import React, {useState} from 'react';
import Draggable from 'react-draggable';
import {FaCog, FaWindowClose} from 'react-icons/fa';
import BookSelector from './book-selector/book-selector';
import CategorySelector from './category-selector/category-selector';
import './options.scss';
import Toggles from './toggles/toggles';
import TypeSelector from './type-selector/type-selector';

export default function Options() {
  const base = 'quick-crafter__options';
  const [opened, setOpened] = useState(false);

  const toggleOptions = () => setOpened(!opened);
  const closeOptions = () => setOpened(false);

  return (
    <>
      <div className={base + '-wrapper'}>
        {opened && (
          <Draggable cancel="label, input, button">
            <div className={base}>
              <FaWindowClose className={base + '--close'} role="button" onClick={closeOptions} />
              <h2 className={base + '-title'}>Options</h2>
              <Toggles className={base + '-section'} />
              <h3>Recipe Filters</h3>
              <BookSelector className={base + '-section'} />
              <CategorySelector className={base + '-section'} />
              <TypeSelector className={base + '-section'} />
            </div>
          </Draggable>
        )}
        <FaCog className={base + '-button'} onClick={toggleOptions} />
      </div>
      <span style={{clear: 'both'}} />
    </>
  );
}
