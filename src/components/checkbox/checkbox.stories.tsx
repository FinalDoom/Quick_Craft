import {expect} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import Checkbox from './checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'padded',
  },
  argTypes: {onChange: {action: 'toggled'}, onClick: {action: 'clicked'}},
};

export default meta;
type Story = StoryObj<typeof Checkbox>;
const testClick = async (playArgs: Parameters<Story['play']>[0]) => {
  const {args, canvasElement} = playArgs;
  const canvas = within(canvasElement);
  const checkbox = canvas.getByRole<HTMLInputElement>('checkbox');
  userEvent.click(checkbox);
  expect(args.onChange).toBeCalled();
  expect(checkbox.checked).toBe(!args.checked);
  userEvent.click(checkbox);
  expect(args.onChange).toBeCalled();
  expect(checkbox.checked).toBe(args.checked);
};

export const Prefixed: Story = {
  args: {prefix: 'Prefix', checked: false},
  play: testClick,
};
export const PrefixedChecked: Story = {
  args: {prefix: 'Prefix Checked', checked: true},
  play: testClick,
};
export const Suffixed: Story = {
  args: {suffix: 'Suffix', checked: false},
  play: testClick,
};
export const SuffixedChecked: Story = {
  args: {suffix: 'Suffix Checked', checked: true},
  play: testClick,
};
export const PrefixAndSuffix: Story = {
  args: {prefix: 'Prefix', suffix: 'Suffix', checked: false},
  play: testClick,
};
export const PrefixAndSuffixChecked: Story = {
  args: {prefix: 'Prefix Che', suffix: 'cked Suffix', checked: true},
  play: testClick,
};
