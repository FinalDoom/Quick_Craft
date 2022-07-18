import React from 'react';
import IngredientQuantity from '../ingredient-quantity/ingredient-quantity';
import ShopLink from '../shop-link/shop-link';

interface Props {
  availableInStore: boolean;
  click: () => void;
  id: number;
  maxCraftableWithPurchase: number;
  name: string;
  purchasable: boolean;
  quantityAvailable: number;
  quantityPerCraft: number;
  switchNeedHave: boolean;
}
interface State {}

export default class IngredientLine extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const classNames = ['crafting-panel-info__ingredient-row'];
    if (this.props.switchNeedHave) {
      classNames.push('crafting-panel-info__ingredient-quantity--swapped');
    }
    if (this.props.purchasable) {
      classNames.push('crafting-panel-info__ingredient--purchasable');
    }
    let max: JSX.Element;
    if (this.props.maxCraftableWithPurchase > this.props.quantityAvailable / this.props.quantityPerCraft) {
      max = (
        <span title="Needed for max possible crafts">
          {' ('}
          {this.props.maxCraftableWithPurchase * this.props.quantityPerCraft - this.props.quantityAvailable}
          {')'}
        </span>
      );
    }

    return (
      <div className={classNames.join(' ')} onClick={this.props.click}>
        <ShopLink ingredientId={this.props.id} availableInStore={this.props.availableInStore} />
        {this.props.name}
        {':'}
        <IngredientQuantity countOnHand={this.props.quantityAvailable} countPerCraft={this.props.quantityPerCraft} />
        {max}
      </div>
    );
  }
}
