import './selectable-button.scss';
import {clsx} from 'clsx';
import Button from '../button';
import React from 'react';

export default function SelectableButton(props: {
  additionalClassNames?: string;
  classNameBase: string;
  text: string;
  clickCallback: () => void;
  selected: boolean;
}) {
  return (
    <Button
      {...props}
      additionalClassNames={clsx(props.additionalClassNames, props.selected && props.classNameBase + '--selected')}
    />
  );
}
