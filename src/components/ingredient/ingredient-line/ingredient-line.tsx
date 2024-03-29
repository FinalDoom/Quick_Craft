import clsx from 'clsx';
import React from 'react';
import IngredientQuantity from '../ingredient-quantity/ingredient-quantity';
import ShopLink from '../shop-link/shop-link';
import './ingredient-line.scss';

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
  const base = 'crafting-panel-info__ingredient';

  return (
    <div className={clsx(base + '-row', props.purchasable && base + '--purchasable')} onClick={props.click}>
      <ShopLink ingredientId={props.id} availableInStore={props.availableInStore} />
      {props.name}
      {':'}
      <IngredientQuantity
        countOnHand={props.quantityAvailable}
        countPerCraft={props.quantityPerCraft}
        switchNeedHave={props.switchNeedHave}
      />
      {props.maxCraftableWithPurchase > props.quantityAvailable / props.quantityPerCraft && (
        <span title="Needed for max possible crafts">
          {' ('}
          {props.maxCraftableWithPurchase * props.quantityPerCraft - props.quantityAvailable}
          {')'}
        </span>
      )}
    </div>
  );
}
