import React from 'react';
import IngredientQuantity from '../ingredient-quantity/ingredient-quantity';
import ShopLink from '../shop-link/shop-link';

export default function IngredientLine(props: {
  availableInStore: boolean;
  click: () => void;
  id: number;
  maxCraftableWithPurchase: number;
  name: string;
  purchasable: boolean;
  quantityAvailable: number;
  quantityPerCraft: number;
  switchNeedHave: boolean;
}) {
  const classNames = ['crafting-panel-info__ingredient-row'];
  if (props.switchNeedHave) {
    classNames.push('crafting-panel-info__ingredient-quantity--swapped');
  }
  if (props.purchasable) {
    classNames.push('crafting-panel-info__ingredient--purchasable');
  }
  let max: JSX.Element;
  if (props.maxCraftableWithPurchase > props.quantityAvailable / props.quantityPerCraft) {
    max = (
      <span title="Needed for max possible crafts">
        {' ('}
        {props.maxCraftableWithPurchase * props.quantityPerCraft - props.quantityAvailable}
        {')'}
      </span>
    );
  }

  return (
    <div className={classNames.join(' ')} onClick={props.click}>
      <ShopLink ingredientId={props.id} availableInStore={props.availableInStore} />
      {props.name}
      {':'}
      <IngredientQuantity countOnHand={props.quantityAvailable} countPerCraft={props.quantityPerCraft} />
      {max}
    </div>
  );
}
