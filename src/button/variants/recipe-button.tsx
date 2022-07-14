import React from 'react';
import {Book} from '../../generated/recipe_info';
import Button from '../button';

interface Props {
  book: Book;
  clickCallback: () => void;
  name: string;
  selected: boolean;
}
interface State {}

export default class RecipeButton extends React.Component<Props, State> {
  base = 'recipes__recipe';

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <Button
        additionalClassNames={this.base + '--book-' + this.props.book.toLocaleLowerCase().replace(/ /g, '-')}
        classNameBase={this.base}
        clickCallback={this.props.clickCallback}
        selected={this.props.selected}
        text={this.props.name}
        variant="select"
      />
    );
  }
}
