import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import {expect, jest} from '@storybook/jest';
import SearchBox from './search-box';

const meta: Meta<typeof SearchBox> = {
  title: 'Components/Search Box',
  component: SearchBox,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'padded',
  },
  argTypes: {changeSearch: {action: 'search changed'}},
};

export default meta;
type Story = StoryObj<typeof SearchBox>;
const changeSearch = jest.fn();
const addToSearch = async ({canvasElement}: {canvasElement: HTMLElement}) => {
  const canvas = within(canvasElement);
  const searchBox = await canvas.findByPlaceholderText('Search...');
  userEvent.type(searchBox, 'a');
  expect(changeSearch).toBeCalled();
  userEvent.type(searchBox, 's');
  expect(changeSearch).toBeCalled();
  userEvent.type(searchBox, 'd');
  expect(changeSearch).toBeCalled();
  userEvent.type(searchBox, 'f');
  expect(changeSearch).toBeCalled();
};
const resetSearch = async ({canvasElement}: {canvasElement: HTMLElement}) => {
  const canvas = within(canvasElement);
  const resetSpan = await canvas.findByRole('button');
  userEvent.click(resetSpan);
  expect(changeSearch).toBeCalled();
};

export const EmptySearch: Story = {};
export const FilledSearch: Story = {
  args: {changeSearch: changeSearch},
  play: addToSearch,
};
export const ResetSearch: Story = {
  args: {initialSearch: 'asdf', changeSearch: changeSearch},
  play: resetSearch,
};
