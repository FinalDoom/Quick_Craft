import './checkbox.scss';
import React, {useState} from 'react';

export default function Checkbox(
  props: {prefix?: string; suffix?: string; checked: boolean} & React.InputHTMLAttributes<HTMLInputElement>,
) {
  const [checked, setChecked] = useState(props.checked);

  return (
    <label className={props.className}>
      {props.prefix}
      <input {...props} type="checkbox" />
      {props.suffix}
    </label>
  );
}
