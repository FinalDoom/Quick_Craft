import clsx from 'clsx';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import Button from '../button';
import './max-craft-button.scss';

enum ConfirmState {
  DEFAULT = 'Craft Maximum',
  CONFIRM = '** CONFIRM **',
  CRAFTING = '-- Crafting --',
}

type MaxCraftButtonHandle = {
  reset: () => void;
};

const MaxCraftButton = forwardRef<
  MaxCraftButtonHandle,
  {executeCraft: () => void; setMaxCraft: () => void} & Omit<Parameters<typeof Button>[0], 'classNameBase' | 'text'>
>((props, ref) => {
  const base = 'crafting-panel-actions__max-craft-button';
  const [state, setState] = useState(ConfirmState.DEFAULT);

  useImperativeHandle(ref, () => ({
    reset: () => setState(ConfirmState.DEFAULT),
  }));

  function click(e: Parameters<Parameters<typeof Button>[0]['onClick']>[0]) {
    props.onClick && props.onClick(e);
    if (state === ConfirmState.DEFAULT) {
      setState(ConfirmState.CONFIRM);
      props.setMaxCraft();
    } else if (state === ConfirmState.CONFIRM) {
      setState(ConfirmState.CRAFTING);
      props.executeCraft();
    }
  }

  return (
    <Button
      {...props}
      additionalClassNames={clsx(props.additionalClassNames, state === ConfirmState.CONFIRM && base + '--confirm')}
      classNameBase={base}
      text={state.toString()}
      onClick={click}
    />
  );
});
export default MaxCraftButton;
