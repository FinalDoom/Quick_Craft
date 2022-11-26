import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import SearchBox from './search-box';

const placeholder = 'Search...!';
const meta: Meta<typeof SearchBox> = {
  title: 'Components/Search Box',
  component: SearchBox,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'padded',
  },
  args: {placeholder: placeholder},
  argTypes: {changeSearch: {action: 'search changed'}},
};

export default meta;
type Story = StoryObj<typeof SearchBox>;
const addToSearch = async (playArgs: Parameters<Story['play']>[0]) => {
  const {args, canvasElement} = playArgs;
  const canvas = within(canvasElement);
  const searchBox = await canvas.findByPlaceholderText(placeholder);
  userEvent.type(searchBox, 'asdf');
  expect(args.changeSearch).toBeCalledTimes(4);
};
const resetSearch = async (playArgs: Parameters<Story['play']>[0]) => {
  const {args, canvasElement} = playArgs;
  const canvas = within(canvasElement);
  const searchBox = await canvas.findByPlaceholderText(placeholder);
  const resetSpan = await canvas.findByRole('button');
  userEvent.click(resetSpan);
  expect(args.changeSearch).toBeCalled();
  expect(document.activeElement).toBe(searchBox);
};

export const EmptySearch: Story = {};
export const FilledSearch: Story = {
  args: {...EmptySearch.args},
  play: addToSearch,
};
export const ResetSearch: Story = {
  args: {...FilledSearch.args, initialSearch: 'asdf'},
  play: resetSearch,
};
