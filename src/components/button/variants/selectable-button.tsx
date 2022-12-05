import clsx from 'clsx';
import React from 'react';
import Button from '../button';
import './selectable-button.scss';

export default function SelectableButton(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    selected: boolean;
  } & Parameters<typeof Button>[0],
) {
  const {additionalClassNames, classNameBase, selected, ...otherProps} = props;
  return (
    <Button
      {...otherProps}
      classNameBase={classNameBase}
      additionalClassNames={clsx(additionalClassNames, selected && classNameBase + '--selected')}
    />
  );
}
