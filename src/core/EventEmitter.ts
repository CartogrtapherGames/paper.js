export type EventCallback = (...args: any[]) => void;

export class EventEmitter extends EventTarget {

  private _wrappers = new Map<string, Map<EventCallback, EventListener>>();

  on(eventName: string, callback: EventCallback, options?: AddEventListenerOptions): void {
    const wrapper: EventListener = (e) => callback(...(e as CustomEvent).detail);
    const callbacks = this._wrappers.get(eventName) ?? new Map();
    callbacks.set(callback, wrapper);
    this._wrappers.set(eventName, callbacks);
    this.addEventListener(eventName, wrapper, options);
  }

  once(eventName: string, callback: EventCallback): void {
    this.on(eventName, callback, { once: true });
  }

  off(eventName: string, callback: EventCallback): void {
    const wrapper = this._wrappers.get(eventName)?.get(callback);
    if (!wrapper) return;
    this.removeEventListener(eventName, wrapper);
    this._wrappers.get(eventName)!.delete(callback);
  }

  emit(eventName: string, ...args: any[]): void {
    this.dispatchEvent(new CustomEvent(eventName, { detail: args }));
  }
}
