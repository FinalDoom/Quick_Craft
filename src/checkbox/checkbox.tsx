import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string;
  suffix?: string;
}
interface State {
  checked: boolean;
}

export default class Checkbox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {checked: this.props.checked};
  }

  change(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({checked: !this.state.checked});
    if (this.props.onChange) this.props.onChange(event);
  }

  render() {
    const checkbox = (
      <input type="checkbox" checked={this.state.checked} onChange={this.change.bind(this)} title={this.props.title} />
    );
    if (!(this.props.prefix || this.props.suffix)) {
      return checkbox;
    } else {
      return (
        <label>
          {this.props.prefix}
          {checkbox}
          {this.props.suffix}
        </label>
      );
    }
  }
}
