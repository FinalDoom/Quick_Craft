import clsx from 'clsx';
import React from 'react';
import './ingredient-quantity.scss';

const defaultProps = {switchNeedHave: false};

export default function IngredientQuantity(propsIn: {
  countOnHand: number;
  countPerCraft: number;
  switchNeedHave?: boolean;
}) {
  const props = {...defaultProps, ...propsIn};
  const base = 'crafting-panel-info__ingredient-quantity';
  return (
    <div className={clsx(base, props.switchNeedHave && base + '--swapped')}>
      <span>{props.countOnHand}</span>/<span>{props.countPerCraft}</span>
    </div>
  );
}
