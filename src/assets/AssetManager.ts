import type {AssetLoader} from "@assets/AssetLoader.ts";
import {AssetCache} from "../cache/AssetCache.ts";
import {JsonLoader} from "@assets/JsonLoader.ts";
import type {NonEmptyArray} from "@utils/arrays/NonEmptyArray.ts";
import type {UnresolvedAsset} from "@assets/UnresolvedAsset.ts";
import {isAbsoluteUrl} from "@utils/strings/IsAbsoluteUrl.ts";
import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";


export class AssetManager {

  private _loaders: Map<string, AssetLoader<any>>;
  private _cache: AssetCache;
  private _queue: Map<string,UnresolvedAsset>

  constructor(basePath: string = "") {
    this._cache = new AssetCache();
    this._cache.startSweeping();
    this._loaders = new Map<string, AssetLoader<any>>();
    this._queue = new Map<string,UnresolvedAsset>();
    this._basePath = basePath;

    this.registerLoader("json", new JsonLoader());
  }

  private _basePath: string = "";

  /**
   * the asset manager base path.
   */
  get basePath(): string {
    return this._basePath;
  }

  /**
   * the asset manager base path.
   * @param value
   */
  set basePath(value: string) {
    this._basePath = value;
  }

  /**
   * register a new loader to the AssetManager
   * @param type - the loader key
   * @param loader - the loader object
   */
  registerLoader(type: string, loader: AssetLoader<any>) {
    if(this._loaders.has(type)) {
      console.warn("loader already exists " + type);
      return;
    }
    this._loaders.set(type, loader);
  }

  add(entries: NonEmptyArray<UnresolvedAsset>) : void;
  add(...entries: NonEmptyArray<UnresolvedAsset>) : void;

  add(first: AssetInput , ...rest: UnresolvedAsset[])  {
    const entries = Array.isArray(first) ? first : [first,...rest];
    for(const entry of entries){
      if(this._queue.has(entry.key)) continue;
      this._queue.set(entry.key, entry);
    }
  }

  async load<T>(key: string): Promise<T>
  async load<T>(key: string[]) : Promise<Record<string,T>>
  async load<T>(): Promise<Record<string, T>>

  /**
   * load the asset and return its appropriate view (.ie texture2D)
   * @param keys - the asset keys
   */
  async load(keys?: string | string[]): Promise<unknown> {
    if(typeof keys === "string") return this.loadAsset(this.getQueued(keys));

    const keysToLoad = keys ?? [...this._queue.keys()];

    return Promise.all(
        keysToLoad.map(async key => [key, await this.loadAsset(this.getQueued(key))] as const)
    ).then(Object.fromEntries);
  }

  exists(key: string): boolean {
    return this._cache.exists(key);
  }

  unload(key: string) {
    if(this.exists(key)) throw new Error(`no asset under the name ${key} to unload`);
    this._cache.unload(key);
  }

  protected getQueued(key: string): UnresolvedAsset {
    if(!this._queue.has(key)) throw new Error("no asset queued under key: " + key);
    return this._queue.get(key);
  }

  protected async loadAsset(entry: UnresolvedAsset): Promise<any> {
    const {url, key, type} = entry;
    const loader = this.getLoader(type);
    if (this.exists(key)) return this.loadCachedAsset(key, loader);

    const resolvedAsset = await loader.load(key, this.resolveUrl(url));
    if (!loader.canCache()) return this.materialize(loader, resolvedAsset);

    const cachedAsset = this._cache.add(resolvedAsset.key, resolvedAsset.source);
    return this.materialize(loader, {key, source: cachedAsset.source, type: resolvedAsset.type});
  }

  protected loadCachedAsset(key: string, loader: AssetLoader<any>): any {
    const cacheEntry = this._cache.get(key);
    cacheEntry.touch();
    return this.materialize(loader, {key, source: cacheEntry.source, type: loader.type});
  }

  protected getLoader(assetType: string): AssetLoader<any> {
    if (!this._loaders.has(assetType)) throw new Error(`No loader registered for type "${assetType}"`);
    return this._loaders.get(assetType);
  }

  /** prefixes relative urls with the base path; leaves absolute urls untouched.
   * @todo maybe expose this as a public API?
   * */
  protected resolveUrl(url: string): string {
    if (isAbsoluteUrl(url)) return url;
    return this._basePath + url;
  }

  private materialize<T>(loader: AssetLoader<T>, resolved: ResolvedAsset<T>): any {
    return loader.create ? loader.create(resolved) : resolved.source;
  }

}

type AssetInput = UnresolvedAsset | NonEmptyArray<UnresolvedAsset>;
