import './search-box.scss';

import React from 'react';

interface Props {
  initialSearch: string;
  changeSearch: (search: string) => void;
}
interface State {}

export default class SearchBox extends React.Component<Props, State> {
  base = 'crafting-panel-search';
  input: HTMLInputElement;

  render() {
    return (
      <span className={this.base + '__searchbox-wrapper'}>
        <input
          className={this.base + '__searchbox'}
          defaultValue={this.props.initialSearch}
          onChange={(event) => this.props.changeSearch(event.target.value)}
          placeholder="Search..."
          ref={(el) => (this.input = el)}
          type="text"
        />
        <span
          onClick={() => {
            this.input.value = '';
            this.input.focus();
            this.props.changeSearch('');
          }}
        >
          x
        </span>
      </span>
    );
  }
}
