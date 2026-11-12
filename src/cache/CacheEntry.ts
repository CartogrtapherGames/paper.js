import type {Disposable} from "./Disposable.ts";
import type {Emittable} from "@assets/Emittable.ts";

// Roughly 6 mins
export const MAX_IDLE_TIME = 360000;

/**
 * the class that manage a cache entry in the cache
 */
export class CacheEntry<T extends Disposable & Emittable> {

  private readonly _source: T;
  private readonly _owners: Set<T>;
  private _lastActivity: number;
  private _transient: boolean;

  /**
   * create a new instance of a CacheEntry with a specific resource.
   * @param source - the source to add to the cache.
   * @param transient - check whether the entry is marked as transient meaning it wont expire even without any owners.
   */
  constructor(source: T, transient = false) {
    this._source = source;
    this._owners = new Set<T>();
    this._transient = transient;
    this._lastActivity = performance.now();
    this._source.on("addOwner", this.addOwner);
    this._source.off("removeOwner", this.removeOwner)
  }

  /**
   * The source last activity
   */
  public get lastActivity(): number {
    return this._lastActivity;
  }

  /**
   * return the cacheEntry source.
   */
  public get source(): T {
    return this._source;
  }

  public touch() {
    this._lastActivity = performance.now();
  }

  /**
   * check whether this resource is currently inactive and staling.
   */
  public isInactive(): boolean {
    const currentTime = performance.now();
    return currentTime > this._lastActivity + MAX_IDLE_TIME
  }

  /**
   * return whether the asset is transient or not.
   * Meaning that even without any owner or if the source is pass the last time it was touched, the source won't be garbage collected.
   */
  public isTransient(): boolean {
    return this._transient;
  }

  /**
   * mark an asset as transient
   */
  public markTransient() {
    this._transient = true;
  }
  /**
   * dispose the resource
   */
  public unload() {
    this._source.dispose(true);
    this._lastActivity = 0;
    this._owners.clear();
    this._source.off("addOwner", this.addOwner);
    this._source.off("removeOwner", this.removeOwner);
  }

  /**
   * check whether this source has any owner left
   */
  public hasOwners(): boolean {
    return this._owners.size > 0;
  }

  /**
   * check whether this source is safe to unload or not.
   */
  public isSafeToUnload(): boolean {
    return !this.hasOwners() && this.isInactive();
  }

  /**
   * add an object as an owner to the source.
   * @param owner - the object to add as an owner
   */
  public addOwner(owner: T) {
    this._owners.add(owner);
    this.touch();
  }

  /**
   * remove an object as an owner from the source owner list
   * @param owner - the object to remove as owner
   */
  public removeOwner(owner: T) {
    this._owners.delete(owner);
    this.touch();
  }
}
