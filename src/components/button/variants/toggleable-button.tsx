import './toggleable-button.scss';
import React, {useState} from 'react';
import Button from '../button';
import clsx from 'clsx';

export default function ToggleableButton(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    text: string;
    selectedChanged: (selected: boolean) => void;
    defaultSelected: boolean;
  } & Parameters<typeof Button>[0],
) {
  const [selected, setSelected] = useState(props.defaultSelected);

  function click(e: Parameters<Parameters<typeof Button>[0]['onClick']>[0]) {
    const nowSelected = !selected;
    setSelected(!nowSelected);
    props.selectedChanged(nowSelected);
    props.onClick(e);
  }

  return (
    <Button
      {...props}
      additionalClassNames={clsx(props.additionalClassNames, props.classNameBase + (selected ? '--on' : '--off'))}
      onClick={click}
    />
  );
}
