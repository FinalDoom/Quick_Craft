import React from 'react';
import {clsx} from 'clsx';

export default function Button(props: {
  additionalClassNames?: string;
  classNameBase: string;
  text: string;
  clickCallback?: () => void;
}) {
  return (
    <button className={clsx(props.classNameBase, props.additionalClassNames)} onClick={props.clickCallback}>
      {props.text}
    </button>
  );
}
