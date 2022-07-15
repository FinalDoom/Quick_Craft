import React from 'react';

function isGMValue(value: any): value is string | number | boolean {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}

export async function getGMStorageValue<T = any>(key: string, defaultValue: T) {
  // getting stored value
  const saved = await GM.getValue(key);
  let initial: any;
  if (saved) {
    if (typeof saved === 'string') {
      try {
        initial = JSON.parse(saved);
      } catch (e) {
        initial = saved;
      }
    } else {
      initial = saved;
    }
  }
  return initial || defaultValue;
}

export async function setGMStorageValue<T = any>(key: string, value: T) {
  console.log('setting', key, '=', value);
  if (value === undefined) {
    await GM.deleteValue(key);
  } else {
    await GM.setValue(key, isGMValue(value) ? value : JSON.stringify(value));
  }
}

export const useGMStorage = async <T = any>(key: string, defaultValue?: T) => {
  const [value, setValue] = React.useState<T>(await getGMStorageValue(key, defaultValue));

  React.useEffect(() => {
    setGMStorageValue(key, value);
  }, [key, value]);

  return [value, setValue] as [T, typeof setValue];
};
