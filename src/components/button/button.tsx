import clsx from 'clsx';
import React, {HTMLAttributes, HTMLProps} from 'react';
import './button.scss';

export default function Button(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    text: string;
  } & HTMLAttributes<HTMLButtonElement> &
    Omit<HTMLProps<HTMLButtonElement>, 'type'>,
) {
  const {classNameBase, additionalClassNames, text, ...htmlProps} = props;
  return (
    <button {...htmlProps} className={clsx(classNameBase, additionalClassNames)}>
      {text}
    </button>
  );
}
