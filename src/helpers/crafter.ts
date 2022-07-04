import {GeneratedRecipe, ingredients} from '../generated_data/recipe_info';

const authKey = new URLSearchParams(document.querySelector<HTMLLinkElement>('link[rel="alternate"]').href).get(
  'authkey',
);
const urlBase = (customRecipe) =>
  `https://gazellegames.net/user.php?action=ajaxtakecraftingresult&recipe=${customRecipe}&auth=${authKey}`;

export function take_craft(recipe: GeneratedRecipe) {
  const craftName = recipe.name || ingredients[recipe.itemId].name;
  fetch(urlBase(recipe.recipe))
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data.EquipID);

      if (data === '{}' || data.EquipId !== '') {
        unsafeWindow.noty({type: 'success', text: `${craftName} was crafted successfully.`});
      } else {
        unsafeWindow.noty({type: 'error', text: `${craftName} failed.`});
        alert(`Crafting failed. Response from server: ${data}`);
      }
    });
}
