import type { AssetLoader } from "./AssetLoader.ts";
import { Texture2D } from "./Texture2D.ts";
import { BitmapSource } from "./BitmapSource.ts";
import { Assets } from "./OldAssetManager.ts";

/**
 * the loader class that handle texture loading and turn them into proper 2D texture.
 */
export class Texture2DLoader implements AssetLoader<BitmapSource> {

  public canCache(): boolean {
    return true;
  }

  async load(url: string): Promise<BitmapSource> {
    const response = await fetch(url);
    if(!response.ok) {
      throw new Error(`Failed to load texture "${url}": ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    return new BitmapSource(bitmap);
  }

  create(source: BitmapSource): Texture2D<BitmapSource> {
    return new Texture2D(source);
  }
}

Assets.registerLoader("texture2D",new Texture2DLoader());
