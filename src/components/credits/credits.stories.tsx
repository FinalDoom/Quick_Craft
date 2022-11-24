import type {Meta, StoryObj} from '@storybook/react';
import Credits from './credits';

const meta: Meta<typeof Credits> = {
  title: 'Footer/Credits',
  component: Credits,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Credits>;

export const Displayed: Story = {};
