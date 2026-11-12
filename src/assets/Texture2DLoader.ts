import type { AssetLoader } from "./AssetLoader.ts";
import { Texture2D } from "./Texture2D.ts";
import { BitmapSource } from "./BitmapSource.ts";
import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";

/**
 * the loader class that handle texture loading and turn them into proper 2D texture.
 */
export class Texture2DLoader implements AssetLoader<BitmapSource> {

  public get type(): string {
    return "texture2D";
  }

  public canCache(): boolean {
    return true;
  }
/*
  async load(url: string): Promise<BitmapSource> {
    const response = await fetch(url);
    if(!response.ok) {
      throw new Error(`Failed to load texture "${url}": ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    return new BitmapSource(bitmap);
  }*/

  async load(key: string, url: string): Promise<ResolvedAsset<BitmapSource>> {
    const response = await fetch(url);
    if(!response.ok){
      throw new Error(`Failed to load texture "${url}": ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const source = new BitmapSource(bitmap);
    return {key,source, type: this.type}
  }

  create(source: ResolvedAsset<BitmapSource>) {
    return new Texture2D(source.source);
  }
}
