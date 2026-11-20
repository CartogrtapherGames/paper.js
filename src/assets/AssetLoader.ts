import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";


export interface AssetOptions {
  
}
/**
 * the interface that shape how a assetLoader should be.
 */
export interface AssetLoader<T> {
  /**
   * the loader type
   */
  get type(): string;

  /**
   * return whether the asset can be cached or not
   */
  canCache(): boolean;

  /**
   * load the assets
   * @param key - the asset key
   * @param url - the asset url
   * @param options - optionals options to add to the loading process.
   * @async
   */
  load(key: string, url: string, options: Partial<AssetOptions>): Promise<ResolvedAsset<T>>;

  /**
   * create an asset and return it.
   * @param source - the asset source
   */
  create?(source: ResolvedAsset<T>) : any;
}
