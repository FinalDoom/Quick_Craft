import React from 'react';
import {Book} from '../../generated/recipe_info';
import Button from '../button';

interface Props {
  book: Book;
  clickCallback: (selected: boolean) => void;
  defaultSelected: boolean;
}
interface State {}

export default class BookButton extends React.Component<Props, State> {
  base = 'crafting-panel-filters__books-button';

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <Button
        additionalClassNames={this.base + '--book-' + this.props.book.toLocaleLowerCase().replace(/ /g, '-')}
        classNameBase={this.base}
        clickCallback={this.props.clickCallback}
        defaultSelected={this.props.defaultSelected}
        text={this.props.book}
        variant="toggle"
      />
    );
  }
}
