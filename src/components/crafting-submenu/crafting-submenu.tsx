import React, {useRef, useState} from 'react';
import {Button, MaxCraftButton} from '../button';
import {ingredients, RecipeInfo} from '../../generated/recipe_info';
import {take_craft} from '../../helpers/crafter';
import IngredientLine from '../ingredient/ingredient-line/ingredient-line';

const CRAFT_TIME = 1000;

export default function CraftingSubmenu(props: {
  inventory: Map<number, number>;
  recipe: RecipeInfo;
  switchNeedHave: boolean;
}) {
  const craftNumberSelect = useRef<HTMLSelectElement>(null);
  const maxCraftButton = useRef<typeof MaxCraftButton & {reset: () => void}>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [purchasable, setPurchasable] = useState([]);

  async function doCraft() {
    setIsCrafting(true);
    try {
      let count = Number(craftNumberSelect.current.value);

      const resultId = props.recipe.itemId;
      for (let i = 0; i < count; i++) {
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            take_craft(props.recipe);
            props.inventory.set(resultId, (props.inventory.get(resultId) || 0) + 1);
            [...props.recipe.ingredientCounts.entries()].forEach(([id, count]) =>
              props.inventory.set(id, props.inventory.get(id) - count),
            );
            resolve();
          }, CRAFT_TIME),
        );
      }
    } finally {
      setIsCrafting(false);
      maxCraftButton.current?.reset();
    }
  }

  let available = Number.MAX_SAFE_INTEGER;
  for (let [id, perCraft] of props.recipe.ingredientCounts.entries()) {
    const onHand = props.inventory.get(id) || 0;
    const avail = Math.floor(onHand / perCraft);
    if (avail < available) {
      available = avail;
    }
  }

  const maxWithPurchase = purchasable.length
    ? Math.min(
        ...props.recipe.ingredients.map((ingredient) =>
          purchasable.includes(ingredient.name)
            ? Number.MAX_SAFE_INTEGER
            : Math.floor((props.inventory.get(ingredient.id) || 0) / props.recipe.ingredientCounts.get(ingredient.id)),
        ),
      )
    : available;

  return (
    <div className="crafting-panel" id="crafting-submenu">
      <div className="crafting-panel__title">
        {ingredients[props.recipe.itemId].name}
        {props.inventory.get(props.recipe.itemId) > 0
          ? ` (${props.inventory.get(props.recipe.itemId)} in inventory)`
          : ''}
      </div>
      <div className="crafting-panel-info__ingredients-header">Ingredients:</div>
      <div className="crafting-panel-info__ingredients-column">
        {[...props.recipe.ingredientCounts.entries()].map(([id, count], index) => {
          const name = props.recipe.ingredients[index].name;
          return (
            <IngredientLine
              key={id}
              availableInStore={props.recipe.ingredients[index].infStock}
              click={() => {
                if (purchasable.includes(name)) {
                  setPurchasable(purchasable.filter((p) => p !== name));
                } else if (purchasable.length < props.recipe.ingredients.length - 1) {
                  setPurchasable([...purchasable, name]);
                }
              }}
              id={id}
              maxCraftableWithPurchase={maxWithPurchase}
              name={name}
              purchasable={purchasable.includes(ingredients[id].name)}
              quantityAvailable={props.inventory.get(id) || 0}
              quantityPerCraft={count}
              switchNeedHave={props.switchNeedHave}
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
            ref={craftNumberSelect}
            className={'crafting-panel-actions__craft-number' + (isCrafting ? ' disabled' : '')}
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
            additionalClassNames={isCrafting ? 'disabled' : ''}
            classNameBase="crafting-panel-actions__craft-button"
            clickCallback={doCraft}
            text="Craft"
          />
          <MaxCraftButton
            ref={maxCraftButton}
            executeCraft={doCraft}
            setMaxCraft={() => craftNumberSelect.current && (craftNumberSelect.current.value = String(available))}
          />
        </div>
      )}
    </div>
  );
}
