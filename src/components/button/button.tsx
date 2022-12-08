import clsx from 'clsx';
import React, {HTMLAttributes, HTMLProps, ReactNode} from 'react';
import './button.scss';

export default function Button(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    children: ReactNode;
  } & HTMLAttributes<HTMLButtonElement> &
    Omit<HTMLProps<HTMLButtonElement>, 'type'>,
) {
  const {classNameBase, additionalClassNames, children, ...htmlProps} = props;
  return (
    <button {...htmlProps} className={clsx(classNameBase, additionalClassNames)}>
      {children}
    </button>
  );
}
