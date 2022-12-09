import clsx from 'clsx';
import React from 'react';
import './checkbox.scss';

export default function Checkbox(
  props: {prefix?: string; suffix?: string} & React.InputHTMLAttributes<HTMLInputElement>,
) {
  const {prefix, suffix, className, title, ...htmlProps} = props;

  return (
    <label className={clsx('quick-crafter__checkbox-label', className)} title={title}>
      {prefix}
      <input {...htmlProps} className="" type="checkbox" />
      {suffix}
    </label>
  );
}
