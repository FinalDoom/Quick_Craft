import React, {HTMLAttributes, HTMLProps} from 'react';
import {ExtraSpaceContext, NeedHaveSwitchContext} from '../../../context/options';
import {Checkbox} from '../../checkbox';
import './toggles.scss';

export default function Toggles(props: {} & HTMLAttributes<HTMLDivElement> & HTMLProps<HTMLDivElement>) {
  return (
    <div {...props}>
      <ExtraSpaceContext.Consumer>
        {({showExtraSpace, setShowExtraSpace}) => (
          <Checkbox
            checked={showExtraSpace}
            onChange={(event) => setShowExtraSpace(event.target.checked)}
            suffix="Blank line between books"
          />
        )}
      </ExtraSpaceContext.Consumer>
      <NeedHaveSwitchContext.Consumer>
        {({switchNeedHave, setSwitchNeedHave}) => (
          <Checkbox
            title="Switches between needed/have and have/needed"
            checked={switchNeedHave}
            onChange={(event) => setSwitchNeedHave(event.target.checked)}
            suffix="Swap ingredient need/have"
          />
        )}
      </NeedHaveSwitchContext.Consumer>
    </div>
  );
}
