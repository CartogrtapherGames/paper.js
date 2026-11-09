import {EventEmitter} from "@core/EventEmitter.ts";

type TextureSourceEventName = "depleted" | string;

/**
 * the class that hold texture data.
 * @remarks it is canvas bound for the moment until a proper renderer is added to hold gpu data.
 */
export abstract class TextureSource<T extends Record<string, any>>  {

  protected _resource: T | null;
  protected _width: number;
  protected _height: number;
  protected _destroyed: boolean;
  protected _refCount: number = 0;

  protected _emitter: EventEmitter;

  constructor(source: T) {
    this._resource = source;
    this._width = source.width;
    this._height = source.height;
    this._destroyed = false;
    this._emitter = new EventEmitter();
    return this;
  }

  /**
   * return the texture source amount of references from textures.
   */
  public get refCount(): number {
    return this._refCount;
  }

  /**
   * return the texture source width
   * @readonly
   */
  get width(): number {
    return this._width;
  }

  /**
   * return the texture source height
   * @readonly
   */
  get height(): number {
    return this._height;
  }

  /**
   * return the texture source original bitmap data
   * @readonly
   */
  get resource(): T | null {
    return this._resource;
  }

  /**
   * return whether a texture source is disposed (unloaded) from the memory or not
   */
  isDisposed(): boolean {
    return this._destroyed;
  }


  /**
   * dispose the texture
   * @abstract
   */
  dispose(force = false): void {
    if (this.isDisposed()) return;
    if (force) {
      this.destroy();
      this.markAsDestroyed();
      return;
    }
    this._refCount--;
    if (this._refCount <= 0) {
      this._emitter.emit("destroy"); // announce it, don't destroy it
    }
  }

  protected abstract destroy(): void;

  /**
   * add a references count to a texture source.
   * @remarks it shouldnt be messed with unless you know what you doing with it.
   */
  public addRef() {
    this._refCount++;
  }

  protected markAsDestroyed(){
    this._destroyed = true;
  }
  /**
   * release the source from the texture until its ref count reach 0 and will emit a depleted event.
   * @deprecated use dispose instead.
   */
  public release() {
    this._refCount--;
    if (this._refCount <= 0) {
      this._emitter.emit("depleted");
    }
  }

  /**
   * subscribe to the source event
   * @param eventName - the event name
   * @param callback - the function callback
   */
  public on(eventName: TextureSourceEventName, callback: () => void) {
    this._emitter.on(eventName, callback);
  }

  /**
   * unsubscribe from to the source event
   * @param eventName - the event name
   * @param callback - the function callback
   */
  public off(eventName: TextureSourceEventName, callback: () => void) {
    this._emitter.off(eventName, callback);
  }

  /**
   * subscribe once to a source event
   * @param eventName - the event name
   * @param callback - the function callback
   */
  public once(eventName: TextureSourceEventName, callback: () => void) {
    this._emitter.once(eventName, callback);
  }

  /**
   * emit a source event
   * @param eventName - the event name
   * @param callback - the function callback
   */
  public emit(eventName: TextureSourceEventName, callback: () => void) {
    this._emitter.emit(eventName, callback);
  }
}
