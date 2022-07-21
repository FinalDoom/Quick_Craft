import React from 'react';
import Button from '../button/button';
import MaxCraftButton from '../button/variants/max-craft-button';
import {ingredients, RecipeInfo} from '../generated/recipe_info';
import {take_craft} from '../helpers/crafter';
import IngredientLine from '../ingredient-line/ingredient-line';

const CRAFT_TIME = 1000;

interface Props {
  inventory: Map<number, number>;
  recipe: RecipeInfo;
  switchNeedHave: boolean;
}
interface State {
  isCrafting: boolean;
  purchasable: Array<string>;
}

export default class CraftingSubmenu extends React.Component<Props, State> {
  craftNumberSelect = React.createRef<HTMLSelectElement>();
  maxCraftButton = React.createRef<MaxCraftButton>();

  constructor(props: Props) {
    super(props);

    this.state = {isCrafting: false, purchasable: []};
  }

  async doCraft() {
    this.setState({isCrafting: true});
    try {
      let count = Number(this.craftNumberSelect.current.value);

      const resultId = this.props.recipe.itemId;
      for (let i = 0; i < count; i++) {
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            take_craft(this.props.recipe);
            this.props.inventory.set(resultId, (this.props.inventory.get(resultId) || 0) + 1);
            [...this.props.recipe.ingredientCounts.entries()].forEach(([id, count]) =>
              this.props.inventory.set(id, this.props.inventory.get(id) - count),
            );
            resolve();
          }, CRAFT_TIME),
        );
      }
    } finally {
      this.setState({isCrafting: false});
      if (this.maxCraftButton.current) this.maxCraftButton.current.reset();
    }
  }

  render() {
    let available = Number.MAX_SAFE_INTEGER;
    for (let [id, perCraft] of this.props.recipe.ingredientCounts.entries()) {
      const onHand = this.props.inventory.get(id) || 0;
      const avail = Math.floor(onHand / perCraft);
      if (avail < available) {
        available = avail;
      }
    }

    const maxWithPurchase = this.state.purchasable.length
      ? Math.min(
          ...this.props.recipe.ingredients.map((ingredient) =>
            this.state.purchasable.includes(ingredient.name)
              ? Number.MAX_SAFE_INTEGER
              : Math.floor(
                  (this.props.inventory.get(ingredient.id) || 0) /
                    this.props.recipe.ingredientCounts.get(ingredient.id),
                ),
          ),
        )
      : available;

    return (
      <div className="crafting-panel" id="crafting-submenu">
        <div className="crafting-panel__title">
          {ingredients[this.props.recipe.itemId].name}
          {this.props.inventory.get(this.props.recipe.itemId) > 0
            ? ` (${this.props.inventory.get(this.props.recipe.itemId)} in inventory)`
            : ''}
        </div>
        <div className="crafting-panel-info__ingredients-header">Ingredients:</div>
        <div className="crafting-panel-info__ingredients-column">
          {[...this.props.recipe.ingredientCounts.entries()].map(([id, count], index) => {
            const name = this.props.recipe.ingredients[index].name;
            return (
              <IngredientLine
                key={id}
                availableInStore={this.props.recipe.ingredients[index].infStock}
                click={() => {
                  if (this.state.purchasable.includes(name)) {
                    this.setState({purchasable: this.state.purchasable.filter((p) => p !== name)});
                  } else if (this.state.purchasable.length < this.props.recipe.ingredients.length - 1) {
                    this.setState({purchasable: [...this.state.purchasable, name]});
                  }
                }}
                id={id}
                maxCraftableWithPurchase={maxWithPurchase}
                name={name}
                purchasable={this.state.purchasable.includes(ingredients[id].name)}
                quantityAvailable={this.props.inventory.get(id) || 0}
                quantityPerCraft={count}
                switchNeedHave={this.props.switchNeedHave}
              />
            );
          })}
        </div>
        <span className="crafting-panel-info__ingredients-max">
          Max available craft(s): {available}
          {available !== maxWithPurchase ? (
            <span title="Max possible if additional ingredients are purchased">({maxWithPurchase})</span>
          ) : (
            ''
          )}
          <sup>
            <a title="Click ingredients to mark as purchasable and calculate +purchase needed and max possible crafted.">
              ?
            </a>
          </sup>
        </span>
        {available > 0 && (
          <div className="crafting-panel-actions">
            <select
              ref={this.craftNumberSelect}
              className={'crafting-panel-actions__craft-number' + (this.state.isCrafting ? ' disabled' : '')}
            >
              {Array(available)
                .fill(undefined)
                .map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
            </select>
            <Button
              variant="click"
              additionalClassNames={this.state.isCrafting ? 'disabled' : ''}
              classNameBase="crafting-panel-actions__craft-button"
              clickCallback={this.doCraft.bind(this)}
              text="Craft"
            />
            <MaxCraftButton
              ref={this.maxCraftButton}
              executeCraft={this.doCraft.bind(this)}
              setMaxCraft={() =>
                this.craftNumberSelect.current && (this.craftNumberSelect.current.value = String(available))
              }
            />
          </div>
        )}
      </div>
    );
  }
}
