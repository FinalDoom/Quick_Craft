import React from 'react';
import {Book} from '../../generated/recipe_info';
import Store from '../../store/store';
import Button from '../button';

interface Props {
  book: Book;
  clickCallback: () => void;
  name: string;
  store: Store;
}
interface State {
  selected: boolean;
}

export default class RecipeButton extends React.Component<Props, State> {
  base = 'recipes__recipe';

  constructor(props: Props) {
    super(props);

    this.state = {selected: this.props.store.currentCraft === this.props.name};
  }

  click() {
    this.props.clickCallback();
    this.setState({selected: this.props.store.currentCraft === this.props.name});
  }

  render() {
    return (
      <Button
        additionalClassNames={this.base + '--book-' + this.props.book.toLocaleLowerCase().replace(/ /g, '-')}
        classNameBase={this.base}
        clickCallback={this.click.bind(this)}
        selected={this.state.selected}
        text={this.props.name}
        variant="select"
      />
    );
  }
}
