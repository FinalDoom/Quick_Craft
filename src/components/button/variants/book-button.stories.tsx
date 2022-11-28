import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import {BOOKS} from '../../../generated/recipe_info';
import BookButton from './book-button';
import ToggleableButtonMeta from './toggleable-button.stories';

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
    ...ToggleableButtonMeta.argTypes,
    book: {
      options: BOOKS,
      control: {type: 'inline-radio'},
    },
  },
};

export default meta;
type Story = StoryObj<typeof BookButton>;
const testClick = (playArgs: Parameters<Story['play']>[0]) => {
  const {args, canvasElement} = playArgs;
  const canvas = within(canvasElement);
  const button = canvas.getByRole('button');
  userEvent.click(button);
  expect(args.onClick).toHaveBeenCalled();
};

export const BookSelected: Story = {args: {defaultSelected: false}, play: testClick};
export const BookUnselected: Story = {args: {defaultSelected: true}, play: testClick};
