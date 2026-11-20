import type {AssetOptions} from "@assets/AssetLoader.ts";

export interface UnresolvedAsset {
  key: string;
  url: string;
  type: string;
  options?: Partial<AssetOptions>;
}
