import React from 'react';

type Variant = 'click' | 'toggle' | 'select';

interface Props {
  additionalClassNames?: string;
  classNameBase: string;
  text: string;
  variant: Variant;
}
interface ClickProps extends Props {
  clickCallback?: () => void;
  variant: 'click';
}
interface SelectProps extends Props {
  clickCallback: () => void;
  selected: boolean;
  variant: 'select';
}
interface ToggleProps extends Props {
  clickCallback: (selected: boolean) => void;
  defaultSelected: boolean;
  variant: 'toggle';
}
interface State {
  selected?: boolean;
}

export default class Button extends React.Component<ClickProps | SelectProps | ToggleProps, State> {
  constructor(props: ClickProps | ToggleProps) {
    super(props);

    if (props.variant === 'toggle') {
      this.state = {selected: props.defaultSelected};
    }
  }

  click() {
    if (this.props.variant === 'toggle') {
      const selected = !this.state.selected;
      this.setState({selected: selected});
      this.props.clickCallback(selected);
    } else {
      if (this.props.clickCallback) {
        this.props.clickCallback();
      }
    }
  }

  render() {
    const classes = [this.props.classNameBase];
    if (this.props.additionalClassNames) {
      classes.push(this.props.additionalClassNames);
    }
    if (this.props.variant === 'select' && this.props.selected) {
      classes.push(this.props.classNameBase + '--selected');
    }
    if (this.props.variant === 'toggle') {
      if (this.state.selected) {
        classes.push(this.props.classNameBase + '--on');
      } else {
        classes.push(this.props.classNameBase + '--off');
      }
    }

    return (
      <button className={classes.join(' ')} onClick={this.click.bind(this)}>
        {this.props.text}
      </button>
    );
  }
}
