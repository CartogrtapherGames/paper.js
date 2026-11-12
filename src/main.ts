import './style.css'
import { Context } from './core/Context.ts'
import type { Drawable } from './core/Drawable.ts'
import {BitmapSource} from "./assets/BitmapSource.ts";
import {Assets} from "@assets/OldAssetManager.ts";
import {Texture2D} from "@assets/Texture2D.ts";
import {Texture2DLoader} from "@assets/Texture2DLoader.ts";
import {Sprite2D} from "@scene/Sprite2D.ts";

const canvas = document.querySelector<HTMLCanvasElement>('#app')!
const context = new Context(canvas)

Assets.registerLoader("texture2D", new Texture2DLoader());

Assets.add({
  url: "./test.png",
  key: "test",
  type: "texture2D"
});

const texture = await Assets.load<Texture2D<BitmapSource>>("test");

const sprite = new Sprite2D();
sprite.texture = texture;

// test for now.
const testBox: Drawable = {
  draw(ctx) {
    ctx.drawImage(texture.textureSource.resource, 10,10);
    sprite.draw(ctx);
  },
}


console.log("texture refCount : " + texture.refCount, " textureSource refCount : " + texture.textureSource.refCount);
function loop(): void {
  context.clear()
  context.draw(testBox)
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
