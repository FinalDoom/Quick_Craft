import React from 'react';
import './search-box.scss';

export default function SearchBox(searchProps: {
  initialSearch: string;
  changeSearch: (search: string) => void;
  placeholder?: string;
}) {
  const base = 'crafting-panel-search__searchbox';
  const props = {placeholder: 'Search...', ...searchProps};
  let input: HTMLInputElement | undefined = null;

  return (
    <span className={base + '-wrapper'}>
      <input
        className={base}
        defaultValue={props.initialSearch}
        onChange={(event) => props.changeSearch(event.target.value)}
        placeholder={props.placeholder}
        ref={(el) => (input = el)}
        role="search"
        type="search"
      />
      <span
        role="button"
        onClick={() => {
          if (input) {
            input.value = '';
            input.focus();
          }
          props.changeSearch('');
        }}
      >
        x
      </span>
    </span>
  );
}
