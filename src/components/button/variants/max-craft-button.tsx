import clsx from 'clsx';
import React, {useContext, useEffect, useState} from 'react';
import {IsCraftingContext} from '../../../context/is-crafting';
import Button from '../button';
import './max-craft-button.scss';

export enum ConfirmState {
  DEFAULT = 'Craft Maximum',
  CONFIRM = '** CONFIRM **',
  CRAFTING = '-- Crafting --',
}

export default function MaxCraftButton(
  props: {executeCraft: () => void; setMaxCraft: () => void} & Omit<
    Parameters<typeof Button>[0],
    'classNameBase' | 'children'
  >,
) {
  const base = 'crafting-panel-actions__max-craft-button';
  const [state, setState] = useState(ConfirmState.DEFAULT);
  const isCraftingContext = useContext(IsCraftingContext);
  const {additionalClassNames, executeCraft, setMaxCraft, onClick, ...otherProps} = props;

  useEffect(() => {
    if (!isCraftingContext.isCrafting) setState(ConfirmState.DEFAULT);
  }, [isCraftingContext.isCrafting]);

  function click(e: Parameters<Parameters<typeof Button>[0]['onClick']>[0]) {
    onClick && onClick(e);
    if (state === ConfirmState.DEFAULT) {
      setState(ConfirmState.CONFIRM);
      setMaxCraft();
    } else if (state === ConfirmState.CONFIRM) {
      setState(ConfirmState.CRAFTING);
      executeCraft();
    }
  }

  return (
    <Button
      {...otherProps}
      additionalClassNames={clsx(additionalClassNames, state === ConfirmState.CONFIRM && base + '--confirm')}
      classNameBase={base}
      children={state.toString()}
      onClick={click}
    />
  );
}
