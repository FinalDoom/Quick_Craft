export default class CountingSet<T> extends Map<T, number> {
  add(value: T) {
    super.set(value, (super.get(value) ?? 0) + 1);
  }

  count(value: T) {
    return super.get(value) ?? 0;
  }

  remove(value: T) {
    if (super.get(value) !== 0) {
      super.set(value, (super.get(value) ?? 1) - 1);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  set(): this {
    throw new TypeError('CountingSet does not support directly setting values');
  }
}
