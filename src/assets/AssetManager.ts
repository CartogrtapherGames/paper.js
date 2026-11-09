import type {AssetLoader} from "./AssetLoader.ts";
import type {AssetTypeMap} from "./AssetTypeMap.ts";
import {JsonLoader} from "@assets/JsonLoader.ts";
import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";

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
export class AssetManager {
	private _loaders = new Map<string, AssetLoader<any>>();
	private _cache = new Map<string, Promise<ResolvedAsset>>();
	private _queue = new Map<string, AssetDescriptor>();
	private _basePath = '';


	constructor() {
		this.registerLoader("json",new JsonLoader()); // DEFAULT loader for json!
	}

	/** registers the loader responsible for a given type key. */
	registerLoader(type: string, loader: AssetLoader<any>) {
		this._loaders.set(type, loader);
	}

	/** root that relative urls passed to {@link load} get resolved against. */
	setBasePath(path: string): void {
		this._basePath = path.endsWith('/') ? path : path + '/';
	}

	/** prefixes relative urls with the base path; leaves absolute urls untouched. */
	private resolveUrl(url: string): string {
		if (isAbsoluteUrl(url)) return url;
		return this._basePath + url;
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
	load<T = unknown>(key: string): Promise<T>
	load<T = unknown>(keys: string[]): Promise<Record<string, T>>
	load<T = unknown>(): Promise<Record<string, T>>
	async load(keys?: string | string[]): Promise<unknown> {
		if (typeof keys === 'string') {
			return this._loadEntry(this._getQueued(keys));
		}

		const keysToLoad = keys ?? [...this._queue.keys()];
		return Promise.all(
			keysToLoad.map(async key => [key, await this._loadEntry(this._getQueued(key))] as const)
		).then(Object.fromEntries);
	}

	private _getQueued(key: string): AssetDescriptor {
		const entry = this._queue.get(key);
		if (!entry) throw new Error(`No asset queued under key "${key}"`);
		return entry;
	}

	private async loadEntry(entry: AssetDescriptor): Promise<any> {
		if(entry.key === "json" || isJson(entry.url)) return this.loadJson(entry);
		const resolvedType = entry.type ?? "texture2D";
		if(this._cache.has(entry.key)) return this.loadCachedAsset(entry);
	}

	private async loadCachedAsset(entry: AssetDescriptor): Promise<any> {
		const resolvedAsset = await this._cache.get(entry.key);
		const loader = this._loaders.get(entry.key);
		const source = resolvedAsset.source;
		// in cases that people just want to return the source or use the loader.create to create a fresh texture.
		if(loader.create){
			return loader.create?.(source);
		} else {
			return source;
		}
	}
	private _loadEntry(entry: AssetDescriptor): Promise<unknown> {
		if(entry.type == "json" || isJson(entry.url))
		{
			return this.loadJson(entry);
		}
		const resolvedType = entry.type ?? 'texture2D';
		if (this._cache.has(entry.key)) return this._cache.get(entry.key)!;

		const loader = this._loaders.get(resolvedType);
		if (!loader) throw new Error(`No loader registered for type "${resolvedType}"`);

		const promise = loader.load(this.resolveUrl(entry.url)).then(source => {
			source.addRef?.();
			return source;
		});
		this._cache.set(entry.key, promise);
		return promise;
	}


	// in this case we do not cache the json and just pass the reference.
	private loadJson(entry: AssetDescriptor): Promise<object> {
		const loader = this._loaders.get("json");
		return loader.load(this.resolveUrl(entry.url)).then(source => {return source;});
	}
}

export const Assets = new AssetManager();


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

