import React from 'react';

export default function IngredientQuantity(props: {countOnHand: number; countPerCraft: number}) {
  return (
    <div className="crafting-panel-info__ingredient-quantity">
      <span>{props.countOnHand}</span>/<span>{props.countPerCraft}</span>
    </div>
  );
}
