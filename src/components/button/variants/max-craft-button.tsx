import './max-craft-button.scss';
import React, {forwardRef, useState, useImperativeHandle} from 'react';
import Button from '../button';

enum ConfirmState {
  DEFAULT = 'Craft Maximum',
  CONFIRM = '** CONFIRM **',
  CRAFTING = '-- Crafting --',
}

const MaxCraftButton = forwardRef((props: {executeCraft: () => void; setMaxCraft: () => void}, ref) => {
  const base = 'crafting-panel-actions__max-craft-button';
  const [state, setState] = useState(ConfirmState.DEFAULT);

  useImperativeHandle(ref, () => {
    reset: () => setState(ConfirmState.DEFAULT);
  });

  function click() {
    props.setMaxCraft();
    if (state === ConfirmState.DEFAULT) {
      setState(ConfirmState.CONFIRM);
    } else if (state === ConfirmState.CONFIRM) {
      setState(ConfirmState.CRAFTING);
      props.executeCraft();
    }
  }

  const additionalClassNames = [];
  if (state === ConfirmState.CONFIRM) {
    additionalClassNames.push(base + '--confirm');
  }

  return (
    <Button
      additionalClassNames={additionalClassNames.join(' ')}
      classNameBase={base}
      clickCallback={click}
      text={state.toString()}
    />
  );
});
export default MaxCraftButton;
