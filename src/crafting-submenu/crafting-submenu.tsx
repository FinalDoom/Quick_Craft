import React from 'react';
import Button from '../button/button';
import MaxCraftButton from '../button/variants/max-craft-button';
import {GeneratedRecipe, ingredients} from '../generated/recipe_info';
import {take_craft} from '../helpers/crafter';
import IngredientLine, {IngredientTemp} from '../ingredient-line/ingredient-line';
import {Inventory} from '../models/inventory';
import CountingSet from '../util/counting-set';

const CRAFT_TIME = 1000;

interface Props {
  inventory: Inventory;
  recipe: GeneratedRecipe;
  switchNeedHave: boolean;
}
interface State {
  purchasable: Array<string>;
}

export default class CraftingSubmenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {purchasable: []};
  }

  async doCraft() {
    // Disable crafting buttons and craft switching
    const craftButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement | HTMLSelectElement>(
        '#crafting-submenu button, #crafting-submenu select',
      ),
    );

    craftButtons.forEach((elem) => {
      elem.disabled = true;
      elem.classList.add('disabled');
    });

    let count = Number(document.querySelector<HTMLSelectElement>('.crafting-panel-actions__craft-number').value);

    for (let i = 0; i < count; i++) {
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          take_craft(this.props.recipe);
          this.props.inventory.addOrSubtractItems({[this.props.recipe.itemId]: 1});
          resolve();
        }, CRAFT_TIME),
      );
    }
    craftButtons.forEach((elem) => {
      elem.disabled = false;
      elem.classList.remove('disabled');
    });
  }

  render() {
    const currentCraft = {available: Number.MAX_SAFE_INTEGER, ingredients: [] as Array<IngredientTemp>};
    const recipeIngredients = this.props.recipe.recipe.match(/.{5}/g);
    const ingredientCounts = new CountingSet<string>();
    recipeIngredients.forEach((item) => ingredientCounts.add(item));
    ingredientCounts.delete('EEEEE');
    for (let [id, perCraft] of ingredientCounts.entries()) {
      const onHand = this.props.inventory.itemCount(String(parseInt(id))) || 0;
      const avail = Math.floor(onHand / perCraft);
      if (avail < currentCraft.available) {
        currentCraft.available = avail;
      }
      currentCraft.ingredients.push({
        name: ingredients[Number(id)].name,
        id: Number(id),
        qty: perCraft,
        onHand: onHand,
      });
    }

    const maxWithPurchase = this.state.purchasable.length
      ? Math.min(
          ...currentCraft.ingredients.map((ingredient) =>
            this.state.purchasable.includes(ingredient.name)
              ? Number.MAX_SAFE_INTEGER
              : Math.floor(ingredient.onHand / ingredient.qty),
          ),
        )
      : currentCraft.available;

    return (
      <div className="crafting-panel" id="crafting-submenu">
        <div className="crafting-panel__title">
          {ingredients[this.props.recipe.itemId].name}
          {this.props.inventory.itemCount(String(this.props.recipe.itemId)) > 0
            ? ` (${this.props.inventory.itemCount(String(this.props.recipe.itemId))} in inventory)`
            : ''}
        </div>
        <div className="crafting-panel-info__ingredients-header">Ingredients:</div>
        <div className="crafting-panel-info__ingredients-column">
          {currentCraft.ingredients.map((ingredient) => (
            <IngredientLine
              key={ingredient.id}
              click={() => {
                if (this.state.purchasable.includes(ingredient.name)) {
                  this.setState({purchasable: this.state.purchasable.filter((p) => p !== ingredient.name)});
                } else if (this.state.purchasable.length < currentCraft.ingredients.length - 1) {
                  const purchasable = this.state.purchasable;
                  purchasable.push(ingredient.name);
                  this.setState({purchasable: purchasable});
                }
              }}
              ingredient={ingredient}
              maxCraftableWithPurchase={maxWithPurchase}
              purchasable={this.state.purchasable.includes(ingredient.name)}
              switchNeedHave={this.props.switchNeedHave}
            />
          ))}
        </div>
        <span className="crafting-panel-info__ingredients-max">
          Max available craft(s): {currentCraft.available}
          {currentCraft.available !== maxWithPurchase ? (
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
        {currentCraft.available > 0 && (
          <div className="crafting-panel-actions">
            <select className="crafting-panel-actions__craft-number">
              {Array(currentCraft.available)
                .fill(undefined)
                .map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
            </select>
            <Button
              variant="click"
              classNameBase="crafting-panel-actions__craft-button"
              clickCallback={this.doCraft.bind(this)}
              text="Craft"
            />
            <MaxCraftButton
              executeCraft={this.doCraft.bind(this)}
              setMaxCraft={() =>
                (document.querySelector<HTMLSelectElement>('.crafting-panel-actions__craft-number').value = String(
                  currentCraft.available,
                ))
              }
            />
          </div>
        )}
      </div>
    );
  }
}
