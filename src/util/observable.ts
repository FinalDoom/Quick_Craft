export interface Observer<T> {
  notify: (data: T) => void;
}

export class Observable<T> {
  #subscribers = new Set<Observer<T>>();

  subscribe(observer: Observer<T>) {
    this.#subscribers.add(observer);
  }

  unsubscribe(observer: Observer<T>) {
    this.#subscribers.delete(observer);
  }

  notify(data: T) {
    for (const subscriber of this.#subscribers) {
      subscriber.notify(data);
    }
  }
}
