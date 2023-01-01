import React from 'react';

function isGMValue(value: any): value is string | number | boolean {
  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}

export async function getGMStorageValue<T = any>(key: string, defaultValue: T) {
  // getting stored value
  const saved = await GM.getValue(key);
  let initial: any;
  if (saved !== undefined) {
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
  return initial === undefined ? defaultValue : initial;
}

export async function setGMStorageValue<T = any>(key: string, value: T) {
  if (value === undefined) {
    await GM.deleteValue(key);
  } else {
    await GM.setValue(key, isGMValue(value) ? value : JSON.stringify(value));
  }
}

export const useGMStorage = async <T = any>(key: string, defaultValue?: T) => {
  const [value, setValue] = React.useState<T>(await getGMStorageValue(key, defaultValue));

  // Update GM store on any change
  React.useEffect(() => {
    setGMStorageValue(key, value);
  }, [key, value]);

  return [value, setValue] as [T, typeof setValue];
};

export const useAsyncGMStorage = <T = any>(key: string, defaultValue?: T) => {
  const [value, setValue] = React.useState<T>(defaultValue);
  const fetched = React.useRef(false);

  // Fetch theh value once asynchronously
  React.useEffect(() => {
    getGMStorageValue(key, defaultValue).then((ret) => {
      if (ret !== value) setValue(ret);
      // Prevent setting the value on initial render, until default has been fetched
      fetched.current = true;
    });
  }, []);

  // Update GM store on any change
  React.useEffect(() => {
    if (fetched.current) setGMStorageValue(key, value);
  }, [key, value]);

  return [value, setValue] as [T, typeof setValue];
};
