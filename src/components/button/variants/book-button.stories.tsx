import type {Meta, StoryObj} from '@storybook/react';
import {BOOKS} from '../../../generated/recipe_info';
import BookButton from './book-button';
import SelectableButtonMeta, {ClickSelected, ClickUnselected} from './selectable-button.stories';

const meta: Meta<typeof BookButton> = {
  title: 'Components/Button/Book Button',
  component: BookButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  args: {book: BOOKS[0]},
  argTypes: {
    ...SelectableButtonMeta.argTypes,
    book: {
      options: BOOKS,
      control: {type: 'inline-radio'},
    },
  },
};

export default meta;
type Story = StoryObj<typeof BookButton>;

export const BookUnselected: Story = {args: {selected: false}};
export const BookSelected: Story = {args: {selected: true}};
export const BookClickUnselected: Story = {...BookUnselected, play: ClickUnselected.play};
export const BookClickSelected: Story = {...BookSelected, play: ClickSelected.play};
