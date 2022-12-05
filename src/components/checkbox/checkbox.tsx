import React from 'react';
import './checkbox.scss';

export default function Checkbox(
  props: {prefix?: string; suffix?: string} & React.InputHTMLAttributes<HTMLInputElement>,
) {
  const {prefix, suffix, className, ...htmlProps} = props;

  return (
    <label className={className}>
      {prefix}
      <input {...htmlProps} className="" type="checkbox" />
      {suffix}
    </label>
  );
}
