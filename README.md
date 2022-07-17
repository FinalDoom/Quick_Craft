# About

This is a Greasemonkey (Tampermonkey/Violentmonkey/Firemonkey) userscript to aid crafting complex or multiple items in the GGn crafting system.

Install URL: https://github.com/FinalDoom/Quick_Craft/releases/latest/download/gazelle-quick-craft.user.js

# Requirements

The script will ask for an API key the first time it runs. You can generate these on the edit profile page. The key must have `Items` permission.

# Usage

1. Install the script in your favorite userscript manager.
2. Visit the crafting page, and the script will load an additional pane between the normal crafting inventory and the list of books, which can be used to craft all recipes.

## Purchasable ingredients

By clicking an ingredient, it will be marked "purchasable."

If more than the currently displayed maximum number of crafts can be made by purchasing marked ingredients,
the possible maximum will be displayed in parentheses next to the current maximum,
and the number necessary to purchase will be displayed next to each ingredient in parentheses:

![Purchasable information displayed in parentheses](https://user-images.githubusercontent.com/677609/179422671-ca9e14c6-28c8-4fd3-b655-fb57b7bbe133.png)

## Search

Displayed recipes can be refined by using the search box. You can search by recipe name or id, or result item name (sometimes different from the recipe name) or id.

If the `Include ingredients` checkbox is checked, the search will also search the ingredient names and ids of each recipe.

> **Note**
> Search terms are combined as "or" by default.

### Advanced searching

The search is backed by [lunr.js](https://lunrjs.com/). See [the lunr search documentation](https://lunrjs.com/guides/searching.html) for more information.

> **Note**
> Term boosting will have no effect as results are not ranked.

Specific supplementary search terms:

* Field searching:
  add the following to the start of a query (after a prefix) to search a specific recipe field
  * `book:` to search recipes that belong to the book named after the colon
    *Note:* This is used internally by the book selection buttons, and will not show additional books that are not selected
  * `ingredients:` to search recipes by ingredient names and ids.
    This will work whether or not the `Include ingredients` checkbox is checked.
  * `name:` to search recipe name and result item id, but not ingredients or result name (where it differs from recipe name)
  * `result:` to search recipe result item name and id, but not recipe name or ingredients.
  > **Note**
  > The following values are not currently exposed to the user, but can be used for searches 
  * `category:` Searches the category of the resulting item, as defined by the site. Values include `equipment`, `potions`, etc.
  * `type:` Searches the type of recipe, as defined by the script. Values are `standard`, `repair`, `upgrade`, and `downgrade`.

## Resetting API Key

To reset the API key, you must remove the Greasemonkey storage key `forumgames_apikey`.
Each script manager has a different way to access and modify the script storage that should be available in its documentation, possibly near info for GM_setValue.
When you find where to modify the script storage, just remove the storage line that starts with `forumgames_apikey`.

If that is not immediately obvious how to accomplish, you can also delete the key by adding a line after `use strict;` in the script, so it reads:

```
use strict;
GM.setValue('forumgames_apikey', null);
```

Remember to remove this line after loading a page where this script runs, or it will always forget your API key.
