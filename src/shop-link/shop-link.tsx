import './shop-link.scss';
import React from 'react';
import {HiCurrencyDollar, HiInformationCircle} from 'react-icons/hi';

export default function ShopLink(props: {ingredientId: number; availableInStore: boolean}) {
  const base = 'crafting-panel-info__ingredient-shop-link';
  return (
    <a
      className={base + (props.availableInStore ? ' ' + base + '--purchasable' : '')}
      target="_blank"
      href={`https://gazellegames.net/shop.php?ItemID=${props.ingredientId}`}
    >
      {props.availableInStore ? <HiCurrencyDollar size="1rem" /> : <HiInformationCircle size="1rem" />}
    </a>
  );
}
