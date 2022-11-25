import type {Meta, StoryObj} from '@storybook/react';
import BookButton from './book-button';

const meta: Meta<typeof BookButton> = {
  title: 'Components/Button/Book Button',
  component: BookButton,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/7.0/react/writing-docs/docs-page
  tags: ['docsPage'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/7.0/react/configure/story-layout
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof BookButton>;
const selectedArgs = {selected: true};

export const Glass: Story = {args: {book: 'Glass'}};
export const GlassSelected: Story = {args: {...Glass.args, ...selectedArgs}};

export const Potions: Story = {args: {book: 'Potions'}};
export const PotionsSelected: Story = {args: {...Potions.args, ...selectedArgs}};

export const Food: Story = {args: {book: 'Food'}};
export const FoodSelected: Story = {args: {...Food.args, ...selectedArgs}};

export const MaterialBars: Story = {args: {book: 'Material Bars'}};
export const MaterialBarsSelected: Story = {args: {...MaterialBars.args, ...selectedArgs}};

export const Armor: Story = {args: {book: 'Armor'}};
export const ArmorSelected: Story = {args: {...Armor.args, ...selectedArgs}};

export const Weapons: Story = {args: {book: 'Weapons'}};
export const WeaponsSelected: Story = {args: {...Weapons.args, ...selectedArgs}};

export const Recasting: Story = {args: {book: 'Recasting'}};
export const RecastingSelected: Story = {args: {...Recasting.args, ...selectedArgs}};

export const Jewelry: Story = {args: {book: 'Jewelry'}};
export const JewelrySelected: Story = {args: {...Jewelry.args, ...selectedArgs}};

export const TradingDecks: Story = {args: {book: 'Trading Decks'}};
export const TradingDecksSelected: Story = {args: {...TradingDecks.args, ...selectedArgs}};

export const XmasCrafting: Story = {args: {book: 'Xmas Crafting'}};
export const XmasCraftingSelected: Story = {args: {...XmasCrafting.args, ...selectedArgs}};

export const Birthday: Story = {args: {book: 'Birthday'}};
export const BirthdaySelected: Story = {args: {...Birthday.args, ...selectedArgs}};

export const Valentines: Story = {args: {book: 'Valentines'}};
export const ValentinesSelected: Story = {args: {...Valentines.args, ...selectedArgs}};

export const Halloween: Story = {args: {book: 'Halloween'}};
export const HalloweenSelected: Story = {args: {...Halloween.args, ...selectedArgs}};

export const AdventureClub: Story = {args: {book: 'Adventure Club'}};
export const AdventureClubSelected: Story = {args: {...AdventureClub.args, ...selectedArgs}};

export const Bling: Story = {args: {book: 'Bling'}};
export const BlingSelected: Story = {args: {...Bling.args, ...selectedArgs}};

export const Pets: Story = {args: {book: 'Pets'}};
export const PetsSelected: Story = {args: {...Pets.args, ...selectedArgs}};
