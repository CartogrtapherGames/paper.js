import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";

import type {UnresolvedAsset} from "@assets/UnresolvedAsset.ts";

export interface AssetLoader<T> {

  get type(): string;
  canCache(): boolean;
  load(key: string, url: string): Promise<ResolvedAsset<T>>;
  create?(source: ResolvedAsset<T>) : any;
}
