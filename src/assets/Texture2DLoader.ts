import type { AssetLoader } from "./AssetLoader.ts";
import { Texture2D } from "./Texture2D.ts";
import { BitmapSource } from "./BitmapSource.ts";
import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";
import {IsImageBitmapSupported} from "@utils/IsImageBitmapSupported.ts";
import {ImageSource} from "@assets/ImageSource.ts";

/**
 * the loader class that handle texture loading and turn them into proper 2D texture.
 */
export class Texture2DLoader implements AssetLoader<BitmapSource | ImageSource> {

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

  async load(key: string, url: string): Promise<ResolvedAsset<BitmapSource | ImageSource>> {
    const response = await fetch(url);
    if(!response.ok){
      throw new Error(`Failed to load texture "${url}": ${response.status} ${response.statusText}`);
    }
    let source: ImageSource | BitmapSource;
    if(IsImageBitmapSupported()){
      const blob = await response.blob();
      const bitmap = await this.loadBitmap(blob);
      source = new BitmapSource(bitmap);
    } else {
      const image = await this.loadImage(url);
      source = new ImageSource(image);
    }

    return {key, source, type: this.type}
  }

  private async loadBitmap(blob: Blob): Promise<ImageBitmap> {
    return await createImageBitmap(blob);
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image "${url}"`));
      image.src = url; // browser fetches the resource itself here
    });
  }


  create(source: ResolvedAsset<BitmapSource>) {
    return new Texture2D(source.source);
  }
}
