import type {AssetLoader} from "./AssetLoader.ts";
import type {AssetTypeMap} from "./AssetTypeMap.ts";
import {JsonLoader} from "@assets/JsonLoader.ts";
import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";
import {AssetCache} from "../cache/AssetCache.ts";

export interface AssetDescriptor<K extends keyof AssetTypeMap = keyof AssetTypeMap> {
  url: string;
  key: string;
  type?: K | string
}

/**
 * format-agnostic asset loader/cache. doesn't know what a "texture2D" or
 * "json" actually is, it just dispatches to whatever loader was registered
 * for that type.
 * {@link load} actually fetches it.
 */
export class OldAssetManager {
  private _loaders = new Map<string, AssetLoader<any>>();
  private _cache = new Map<string, Promise<ResolvedAsset>>();
  private _queue = new Map<string, AssetDescriptor>();
  private _basePath = '';
  private cache: AssetCache;


  constructor() {
    this.cache = new AssetCache();
    this.registerLoader("json", new JsonLoader()); // DEFAULT loader for json!
  }

  /** registers the loader responsible for a given type key. */
  registerLoader(type: string, loader: AssetLoader<any>) {
    this._loaders.set(type, loader);
  }

  /** root that relative urls passed to {@link load} get resolved against. */
  setBasePath(path: string): void {
    this._basePath = path.endsWith('/') ? path : path + '/';
  }

  /** queues one or more assets to load later via {@link load}. doesn't fetch anything yet. */
  add(entries: AssetDescriptor[]): void

  add(...entries: AssetDescriptor[]): void

  add(first: AssetDescriptor[] | AssetDescriptor, ...rest: AssetDescriptor[]): void {
    const entries = Array.isArray(first) ? first : [first, ...rest];
    for (const entry of entries) {
      this._queue.set(entry.key, entry);
    }
  }

  /**
   * loads one queued key, every key given, or (with no argument) everything currently queued.
   * `T` is not inferred (the type tag lives on the queued entry, not on this call), so pass it
   * explicitly when you want a typed result instead of `unknown`, e.g. `load<Texture2D<BitmapSource>>('hero')`.
   */
  load<T>(key: string): Promise<T>

  load<T>(keys: string[]): Promise<Record<string, T>>

  load<T>(): Promise<Record<string, T>>

  async load(keys?: string | string[]): Promise<unknown> {
    if (typeof keys === 'string') {
      return this.loadEntry(this._getQueued(keys));
    }

    const keysToLoad = keys ?? [...this._queue.keys()];
    return Promise.all(
        keysToLoad.map(async key => [key, await this.loadEntry(this._getQueued(key))] as const)
    ).then(Object.fromEntries);
  }

  public exists(key: string): boolean {
    return this.cache.exists(key);
  }

  protected async loadAsset(entry: AssetDescriptor): Promise<any> {
    const {url, key, type} = entry;
    const loader = this.getLoader(type)
    if (this.exists(key)) return this.loadCachedAsset(key, loader);

    const asset = await loader.load(this.resolveUrl(url));
    if (loader.canCache?.()) {
      const cachedAsset = this.cache.add(key, asset);
      if (loader.create) {
        return loader.create?.(cachedAsset.source);
      } else {
        return cachedAsset.source;
      }
    } else {
     return asset;
    }
  }

  protected loadCachedAsset(key: string, loader: AssetLoader<any>): any {
    const cachedAsset = this.cache.get(key);
    if (loader.create?.(cachedAsset.source)) {
      return loader.create?.(cachedAsset.source);
    } else {
      return cachedAsset.source;
    }
  }

  /** prefixes relative urls with the base path; leaves absolute urls untouched. */
  private resolveUrl(url: string): string {
    if (isAbsoluteUrl(url)) return url;
    return this._basePath + url;
  }

  private _getQueued(key: string): AssetDescriptor {
    const entry = this._queue.get(key);
    if (!entry) throw new Error(`No asset queued under key "${key}"`);
    return entry;
  }

  protected async loadEntry(entry: AssetDescriptor): Promise<any> {
    const {key,type} = entry;
    if (this._cache.has(entry.key)) return this.loadCachedAsset(key,this.getLoader(type));
    return this.loadAsset(entry);
  }

  private getLoader(assetType: string): AssetLoader<any> {
    if (!this._loaders.has(assetType)) throw new Error(`No loader registered for type "${assetType}"`);
    return this._loaders.get(assetType);
  }
}

export const Assets = new OldAssetManager();


/**
 * check whether the asset is json.
 * @remarks the usage of this is to ensure that json are not cached and just landed as references. as we dont want to have
 * to hold data and have to manually release them.
 * @param str
 */
function isJson(str: string): boolean {
  return str.includes('.json');
}

function isAbsoluteUrl(url: string): boolean {
  return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) || url.startsWith('/') || url.startsWith('data:');
}

