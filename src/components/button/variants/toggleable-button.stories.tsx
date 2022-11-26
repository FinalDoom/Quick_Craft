import {action} from '@storybook/addon-actions';
import {expect, jest} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {within} from '@storybook/testing-library';
import ButtonStoryMeta, {Clickable} from '../button.stories';
import ToggleableButton from './toggleable-button';

const selectedChagned = jest.fn(action('selected changed'));
const meta: Meta<typeof ToggleableButton> = {
  title: 'Components/Button/Toggleable Button',
  component: ToggleableButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  args: {style: {backgroundColor: 'green'}, selectedChanged: selectedChagned},
  argTypes: {...ButtonStoryMeta.argTypes, selectedChanged: {action: 'selected changed'}},
};

export default meta;
type Story = StoryObj<typeof ToggleableButton>;
const doClick = async (args, clsSuffix) => {
  Clickable.play(args);
  const {canvasElement} = args;
  const canvas = within(canvasElement);
  const button = await canvas.findByRole('button');
  expect(selectedChagned).toBeCalled();
  expect(Array.from(button.classList).some((cls) => cls.endsWith(clsSuffix))).toBe(true);
};

export const Unselected: Story = {args: {text: 'Default Not Selected', defaultSelected: false}};
export const Selected: Story = {args: {text: 'Default Selected', defaultSelected: true}};
export const ClickUnselected: Story = {
  args: Unselected.args,
  play: async (args) => await doClick(args, '--on'),
};
export const ClickSelected: Story = {
  args: Selected.args,
  play: async (args) => await doClick(args, '--off'),
};
