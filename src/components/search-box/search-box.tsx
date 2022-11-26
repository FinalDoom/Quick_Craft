import React from 'react';
import './search-box.scss';

export default function SearchBox(props: {initialSearch: string; changeSearch: (search: string) => void}) {
  const base = 'crafting-panel-search__searchbox';
  let input: HTMLInputElement | undefined = null;

  return (
    <span className={base + '-wrapper'}>
      <input
        className={base}
        defaultValue={props.initialSearch}
        onChange={(event) => props.changeSearch(event.target.value)}
        placeholder="Search..."
        ref={(el) => (input = el)}
        type="text"
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
