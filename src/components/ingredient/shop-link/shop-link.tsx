import clsx from 'clsx';
import React from 'react';
import {HiCurrencyDollar, HiInformationCircle} from 'react-icons/hi';
import './shop-link.scss';

export default function ShopLink(props: {ingredientId: number; availableInStore: boolean}) {
  const base = 'crafting-panel-info__ingredient-shop-link';
  return (
    <a
      className={clsx(base, props.availableInStore && base + '--purchasable')}
      target="_blank"
      href={`/shop.php?ItemID=${props.ingredientId}`}
    >
      {props.availableInStore ? <HiCurrencyDollar size="1rem" /> : <HiInformationCircle size="1rem" />}
    </a>
  );
}
