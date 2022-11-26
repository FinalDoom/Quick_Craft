import clsx from 'clsx';
import React, {HTMLAttributes} from 'react';

export default function Button(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    text: string;
  } & HTMLAttributes<HTMLButtonElement>,
) {
  const {classNameBase, additionalClassNames, text, ...htmlProps} = props;
  return (
    <button {...htmlProps} className={clsx(classNameBase, additionalClassNames)}>
      {text}
    </button>
  );
}
