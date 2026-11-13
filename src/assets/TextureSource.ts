import {EventEmitter} from "@core/EventEmitter.ts";
import type {Disposable} from "../cache/Disposable.ts";
import type {Emittable} from "@assets/Emittable.ts";


interface TextureSourceEvents {
  addOwner: Disposable;
  removeOwner: Disposable;
  destroy: void;
  depleted: void;
}

/**
 * the class that hold texture data.
 * @remarks it is canvas bound for the moment until a proper renderer is added to hold gpu data.
 */
export abstract class TextureSource<T extends Record<string, any>> implements Disposable, Emittable<TextureSourceEvents> {

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

  public addOwner(owner: Disposable) {
    this.emit("addOwner", owner);
  }

  public removeOwner(owner: Disposable) {
    this.emit("removeOwner", owner);
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
   */
  dispose(force = false): void {
    if (this.isDisposed()) return;
    if (force) {
      this.destroy();
      this.markAsDestroyed();
      return;
    }
  }

  abstract destroy(): void;

  protected markAsDestroyed() {
    this._destroyed = true;
  }

  public on<K extends keyof TextureSourceEvents>(
      eventName: K,
      callback: (payload: TextureSourceEvents[K]) => void
  ): void {
    this._emitter.on(eventName as string, callback);
  }

  public off<K extends keyof TextureSourceEvents>(
      eventName: K,
      callback: (payload: TextureSourceEvents[K]) => void
  ): void {
    this._emitter.off(eventName as string, callback);
  }

  public once<K extends keyof TextureSourceEvents>(
      eventName: K,
      callback: (payload: TextureSourceEvents[K]) => void
  ): void {
    this._emitter.once(eventName as string, callback);
  }

  public emit<K extends keyof TextureSourceEvents>(
      eventName: K,
      payload: TextureSourceEvents[K]
  ): void {
    this._emitter.emit(eventName as string, payload);
  }
}
