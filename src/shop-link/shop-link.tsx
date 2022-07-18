import './shop-link.scss';
import React from 'react';
import {HiCurrencyDollar, HiInformationCircle} from 'react-icons/hi';

interface Props {
  ingredientId: number;
  availableInStore: boolean;
}
interface State {}

export default class ShopLink extends React.Component<Props, State> {
  base = 'crafting-panel-info__ingredient-shop-link';

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <a
        className={this.base + (this.props.availableInStore ? ' ' + this.base + '--purchasable' : '')}
        target="_blank"
        href={`https://gazellegames.net/shop.php?ItemID=${this.props.ingredientId}`}
      >
        {this.props.availableInStore ? <HiCurrencyDollar size="1rem" /> : <HiInformationCircle size="1rem" />}
      </a>
    );
  }
}
