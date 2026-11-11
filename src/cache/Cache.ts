import type {CacheEntry} from "./CacheEntry.ts";
import type {Disposable} from "./Disposable.ts";


export class Cache {

  private _cache : Map<string,CacheEntry<Disposable>>;

  constructor(){
    this._cache = new Map();
  }

  public add(key: string, source: Disposable): CacheEntry<Disposable> {
    if(this.exists(key)) return this._cache.get(key);
  }

  public get<T extends Disposable>(key: string): CacheEntry<T> {
    if(this.exists(key)) return this._cache.get(key) as CacheEntry<T>;
    throw new Error(`Cache key "${key}" does not exist`);
  }

  public exists(key: string): boolean {
    return this._cache.has(key);
  }

  public unload(key: string) {
    if(!this.exists(key)) throw new Error(`Cache key "${key}" does not exist`);
    const cacheEntry = this._cache.get(key);
    cacheEntry.unload();
    this.remove(key);
  }

  public remove(key: string): void {
    if(!this.exists(key)) throw new Error(`Cache key "${key}" does not exist`);
    this._cache.delete(key);
  }

  public destroy() {
    for(const key in this._cache) {
      const cacheEntry = this._cache.get(key);
      cacheEntry.unload();
      this.remove(key);
    }
  }
}
