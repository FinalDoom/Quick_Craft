import clsx from 'clsx';
import React, {HTMLAttributes} from 'react';

export default function Button(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    text: string;
  } & HTMLAttributes<HTMLButtonElement>,
) {
  return (
    <button {...props} className={clsx(props.classNameBase, props.additionalClassNames)}>
      {props.text}
    </button>
  );
}
