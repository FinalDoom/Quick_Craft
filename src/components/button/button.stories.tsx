import {action} from '@storybook/addon-actions';
import {expect, jest} from '@storybook/jest';
import type {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import Button from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button/Plain Button',
  component: Button,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
  argTypes: {onClick: {action: 'clicked'}},
};

export default meta;
type Story = StoryObj<typeof Button>;
const clicked = jest.fn(action('clicked'));

export const Clickable: Story = {
  args: {onClick: clicked, text: 'Click Me'},
  play: async ({canvasElement}: {canvasElement: HTMLElement}) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    expect(clicked).toBeCalled();
  },
};

// TODO might need a disabled test here for proper encapsulation
