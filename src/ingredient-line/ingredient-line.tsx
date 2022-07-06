import React from 'react';
import IngredientQuantity from '../ingredient-quantity/ingredient-quantity';
import ShopLink from '../shop-link/shop-link';
import Store from '../store/store';

export type IngredientTemp = {id: number; name: string; onHand: number; qty: number};
interface Props {
  click: () => void;
  ingredient: IngredientTemp;
  maxCraftableWithPurchase: number;
  purchasable: boolean;
  store: Store;
}
interface State {}

function titleCaseFromUnderscored(str: string) {
  return str.replace(/_/g, ' ').replace(/(?:^|\s)\w/g, function (match) {
    return match.toUpperCase();
  });
}

export default class IngredientLine extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {id: ingredId, name: ingredName, onHand: qtyOnHand, qty: qtyPerCraft} = this.props.ingredient;

    const classNames = ['crafting-panel-info__ingredient-row'];
    if (this.props.store.switchNeedHave) {
      classNames.push('crafting-panel-info__ingredient-row-quantity-swapped');
    }
    if (this.props.purchasable) {
      classNames.push('crafting-panel-info__ingredient--purchasable');
    }
    let max: JSX.Element;
    if (this.props.maxCraftableWithPurchase > qtyOnHand / qtyPerCraft) {
      max = (
        <span title="Needed for max possible crafts">
          {' '}
          {this.props.maxCraftableWithPurchase * qtyPerCraft - qtyOnHand}
        </span>
      );
    }

    return (
      <div className={classNames.join(' ')} onClick={this.props.click}>
        <ShopLink ingredientId={ingredId} />
        {titleCaseFromUnderscored(ingredName)}
        {':'}
        <IngredientQuantity countOnHand={qtyOnHand} countPerCraft={qtyPerCraft} />
        {max}
      </div>
    );
  }
}
