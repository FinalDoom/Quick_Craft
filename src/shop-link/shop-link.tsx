import React from 'react';

interface Props {
  ingredientId: number;
}
interface State {}

export default class ShopLink extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <a
        className="crafting-panel-info__ingredient-shop-link"
        target="_blank"
        href={`https://gazellegames.net/shop.php?ItemID=${this.props.ingredientId}`}
      >
        $
      </a>
    );
  }
}
