import {GeneratedRecipe, ingredients} from '../generated_data/recipe_info';

const authKey = new URLSearchParams($('link[rel="alternate"]').attr('href')).get('authkey');
const urlBase = (customRecipe) =>
  `https://gazellegames.net/user.php?action=ajaxtakecraftingresult&recipe=${customRecipe}&auth=${authKey}`;

export function take_craft(recipe: GeneratedRecipe) {
  const craftName = recipe.name || ingredients[recipe.itemId].name;
  $.get(urlBase(recipe.recipe), function (data) {
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
