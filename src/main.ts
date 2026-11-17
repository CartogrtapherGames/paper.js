import './style.css'
import { Context } from '@core'
import type { Drawable } from './core/Drawable.ts'
import {BitmapSource} from "@assets";
import {Assets} from "@assets/AssetManager.ts";
import {Texture2D} from "@assets/Texture2D.ts";
import {Texture2DLoader} from "@assets/Texture2DLoader.ts";

const canvas = document.querySelector<HTMLCanvasElement>('#app')!
const context = new Context(canvas)

Assets.registerLoader("texture2D", new Texture2DLoader());

Assets.add({
  url: "./test.png",
  key: "test",
  type: "texture2D"
});

const texture = await Assets.load<Texture2D<BitmapSource>>("test");
const texture2 = await Assets.load<Texture2D>("test");
Assets.debug();

console.log(texture.isHtmlImage());
//const sprite = new Sprite2D();
//sprite.texture = texture;

// test for now.
const testBox: Drawable = {
  draw(ctx) {
    ctx.drawImage(texture.textureSource.resource, 10,10);
  },
}


function loop(): void {
  context.clear()
  context.draw(testBox)
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)
