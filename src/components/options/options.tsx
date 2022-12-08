import React, {useState} from 'react';
import Draggable from 'react-draggable';
import {FaCog} from 'react-icons/fa';
import {Button} from '../button';
import BookSelector from './book-selector/book-selector';
import './options.scss';
import Toggles from './toggles/toggles';

export default function Options() {
  const base = 'quick-crafter__options';
  const [opened, setOpened] = useState(false);

  const toggleOptions = () => setOpened(!opened);
  const closeOptions = () => setOpened(false);

  return (
    <>
      <Button classNameBase={base + '-button'} onClick={toggleOptions}>
        <FaCog />
      </Button>
      {opened && (
        <Draggable defaultPosition={{x: 600, y: 0}}>
          {
            // bounds="#quick-crafter" -- weird cuz of centering margin junk
            // 1100px - width (450) - padding/fudge = 650 - 50 = 600
            // positionOffset={{x: 'right', y: 'top'}}>
            // offset not working, but try anyway on full page -- stick top right to the button or so
          }
          <div className={base}>
            <div className={base + '-header'}>
              <div className={base + '-title'}>Options</div>
              <span className={base + '--close'} role="button" onClick={closeOptions}>
                x
              </span>
            </div>
            <Toggles />
            <BookSelector />
          </div>
        </Draggable>
      )}
    </>
  );
}
