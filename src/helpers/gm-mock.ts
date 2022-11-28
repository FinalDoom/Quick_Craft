import Logger from '../log/log';

const log = Logger.getLogger('GM Mock');

export namespace GMMock {
  export type Value = string | boolean | number;
  export async function getValue<TValue = GM.Value>(name: string, defaultValue?: TValue): Promise<TValue | undefined> {
    log.debug('getValue(', name, defaultValue, ')');
    return defaultValue;
  }
  export async function deleteValue(name: string): Promise<void> {
    log.debug('deleteValue(', name, ')');
  }
  export async function setValue(name: string, value: GM.Value): Promise<void> {
    log.debug('setValue(', name, value, ')');
  }
}
