import clsx from 'clsx';
import React from 'react';
import Button from '../button';
import './toggleable-button.scss';

export default function ToggleableButton(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    text: string;
    selectedChanged: (selected: boolean) => void;
    selected: boolean;
  } & Parameters<typeof Button>[0],
) {
  const {additionalClassNames, selectedChanged, selected, ...otherProps} = props;

  function click(e: Parameters<Parameters<typeof Button>[0]['onClick']>[0]) {
    selectedChanged && selectedChanged(!selected);
    otherProps.onClick && otherProps.onClick(e);
  }

  return (
    <Button
      {...otherProps}
      additionalClassNames={clsx(additionalClassNames, props.classNameBase + (selected ? '--on' : '--off'))}
      onClick={click}
    />
  );
}
