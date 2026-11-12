import {CacheEntry, MAX_IDLE_TIME} from "./CacheEntry.ts";
import type {Disposable} from "./Disposable.ts";


/**
 * The cache class that handle keeping track of resources and sweep them away when not used anymore.
 * it also has the capacity to have an asset to be transient.
 * the cache is made to smartly unload when not needed anymore.
 * @todo in future check for staleness protocol as it would simplify the cache and unloading.
 */
export class AssetCache {

  private readonly _cache : Map<string,CacheEntry<Disposable>>;
  private _sweepHandle?: ReturnType<typeof setInterval>;

  /**
   * create a new cache instance
   */
  constructor(){
    this._cache = new Map();
  }

  /**
   * start sweeping periodically the cache to see if resources needs to be removed or not.
   * @param intervalMs
   */
  public startSweeping(intervalMs = MAX_IDLE_TIME / 2){
    this._sweepHandle = setInterval(() => this.sweep(), intervalMs);
  }

  /**
   * stop the cache from sweeping periodically
   */
  public stopSweeping(){
    if(this._sweepHandle){
      clearInterval(this._sweepHandle);
    }
  }

  /**
   * sweep the cache.
   */
  private sweep(){
    for(const [key, entry] of this._cache) {
      if(entry.isTransient()) continue;
      if(entry.isSafeToUnload()) this.unload(key);
    }
  }

  /**
   * add a resources to the cache.
   * @param key
   * @param source
   */
  public add(key: string, source: Disposable): CacheEntry<Disposable> {
    if(this.exists(key)) return this._cache.get(key);
    const entry = new CacheEntry(source);
    this._cache.set(key,entry)
    return entry;
  }

  /**
   * Fetch a resources from the cache.
   * @param key - the resource key
   */
  public get<T extends Disposable>(key: string): CacheEntry<T> {
    if(this.exists(key)) return this._cache.get(key) as CacheEntry<T>;
    throw new Error(`Cache key "${key}" does not exist`);
  }

  /**
   * check if a resources exists in the cache
   * @param key - the resource key
   */
  public exists(key: string): boolean {
    return this._cache.has(key);
  }

  /**
   * force unload a resource from the cache.
   * @param key
   */
  public unload(key: string) {
    if(!this.exists(key)) throw new Error(`Cache key "${key}" does not exist`);
    const cacheEntry = this._cache.get(key);
    cacheEntry.unload();
    this.remove(key);
  }

  /**
   * remove the resource from the cache.
   * @param key - the resource to remove.
   */
  private remove(key: string): void {
    if(!this.exists(key)) throw new Error(`Cache key "${key}" does not exist`);
    this._cache.delete(key);
  }

  /**
   * destroy the cache
   */
  public destroy() {
    this.stopSweeping();
    for (const [key, entry] of this._cache) {
      entry.unload();
    }
    this._cache.clear();
  }
}
