import React from 'react';
import Button from '../button';

enum ConfirmState {
  DEFAULT,
  CONFIRM,
  CRAFTING,
}

interface Props {
  executeCraft: () => void;
  setMaxCraft: () => void;
}
interface State {
  state: ConfirmState;
}

export default class MaxCraftButton extends React.Component<Props, State> {
  base = 'crafting-panel-actions__max-craft-button';

  constructor(props: Props) {
    super(props);

    this.state = {state: ConfirmState.DEFAULT};
  }

  click() {
    this.props.setMaxCraft();
    if (this.state.state === ConfirmState.DEFAULT) {
      this.setState({state: ConfirmState.CONFIRM});
    } else if (this.state.state === ConfirmState.CONFIRM) {
      this.setState({state: ConfirmState.CRAFTING});
      this.props.executeCraft();
    }
  }

  render() {
    const additionalClassNames = [];
    if (this.state.state === ConfirmState.CONFIRM) {
      additionalClassNames.push(this.base + '--confirm');
    }
    const text =
      this.state.state === ConfirmState.DEFAULT
        ? 'Craft maximum'
        : this.state.state === ConfirmState.CONFIRM
        ? '** CONFIRM **'
        : '-- Crafting --';

    return (
      <Button
        additionalClassNames={additionalClassNames.join(' ')}
        classNameBase={this.base}
        clickCallback={this.click.bind(this)}
        text={text}
        variant="click"
      />
    );
  }

  reset() {
    this.setState({state: ConfirmState.DEFAULT});
  }
}
