const background = 'color:black;background-color:chocolate;border-radius:2px;padding:1px;';
const clear = '';

export namespace GMMock {
  export type Value = string | boolean | number;
  export async function getValue<TValue = GM.Value>(name: string, defaultValue?: TValue): Promise<TValue | undefined> {
    console.log('%cGM Mock:%c getValue(', background, clear, name, defaultValue, ')');
    return defaultValue;
  }
  export async function deleteValue(name: string): Promise<void> {
    console.log('%cGM Mock:%c deleteValue(', background, clear, name, ')');
  }
  export async function setValue(name: string, value: GM.Value): Promise<void> {
    console.log('%cGM Mock:%c setValue(', background, clear, name, value, ')');
  }
}
