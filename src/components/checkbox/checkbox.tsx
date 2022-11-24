import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix?: string;
  suffix?: string;
  checked: boolean;
}
interface State {}

export default class Checkbox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {checked: this.props.checked};
  }

  render() {
    return (
      <label className={this.props.className}>
        {this.props.prefix}
        <input type="checkbox" checked={this.props.checked} onChange={this.props.onChange} title={this.props.title} />
        {this.props.suffix}
      </label>
    );
  }
}
