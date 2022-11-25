import './toggleable-button.scss';
import React, {useState} from 'react';
import Button from '../button';
import {clsx} from 'clsx';

export default function ToggleableButton(props: {
  additionalClassNames?: string;
  classNameBase: string;
  text: string;
  clickCallback: (selected: boolean) => void;
  defaultSelected: boolean;
}) {
  const [selected, setSelected] = useState(props.defaultSelected);

  function click() {
    const nowSelected = !selected;
    setSelected(!nowSelected);
    props.clickCallback(nowSelected);
  }

  return (
    <Button
      {...props}
      additionalClassNames={clsx(props.additionalClassNames, props.classNameBase + (selected ? '--on' : '--off'))}
      clickCallback={click}
    />
  );
}
