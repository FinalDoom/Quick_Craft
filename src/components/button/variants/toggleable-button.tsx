import clsx from 'clsx';
import React, {useState} from 'react';
import Button from '../button';
import './toggleable-button.scss';

export default function ToggleableButton(
  props: {
    additionalClassNames?: string;
    classNameBase: string;
    text: string;
    selectedChanged: (selected: boolean) => void;
    defaultSelected: boolean;
  } & Parameters<typeof Button>[0],
) {
  const {additionalClassNames, selectedChanged, defaultSelected, ...otherProps} = props;
  const [selected, setSelected] = useState(defaultSelected);

  function click(e: Parameters<Parameters<typeof Button>[0]['onClick']>[0]) {
    const nowSelected = !selected;
    setSelected(nowSelected);
    selectedChanged && selectedChanged(nowSelected);
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
