import type {Meta, StoryObj} from '@storybook/react';
import Options from './options';

const meta: Meta<typeof Options> = {
  title: 'Components/Options/Main',
  component: Options,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Options>;

export const Displayed: Story = {};
