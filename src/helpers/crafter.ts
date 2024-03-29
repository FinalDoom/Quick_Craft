import {ingredients, RecipeInfo} from '../generated/recipe_info';

const authKey = new URLSearchParams(document.querySelector<HTMLLinkElement>('link[rel="alternate"]')?.href).get(
  'authkey',
);
const urlBase = (customRecipe) => `/user.php?action=ajaxtakecraftingresult&recipe=${customRecipe}&auth=${authKey}`;

export function take_craft(recipe: RecipeInfo) {
  const craftName = recipe.name || ingredients[recipe.itemId].name;
  fetch(urlBase(recipe.recipe))
    .then((response) => response.json())
    .then((data) => {
      if (data === '{}' || data.EquipId !== '') {
        unsafeWindow.noty({type: 'success', text: `${craftName} was crafted successfully.`});
      } else {
        unsafeWindow.noty({type: 'error', text: `${craftName} failed.`});
        alert(`Crafting failed. Response from server: ${data}`);
      }
    });
}
