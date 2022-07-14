import React from 'react';

interface Props {
  countOnHand: number;
  countPerCraft: number;
}
interface State {}

export default class IngredientQuantity extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="crafting-panel-info__ingredient-quantity">
        <span>{this.props.countOnHand}</span>/<span>{this.props.countPerCraft}</span>
      </div>
    );
  }
}
