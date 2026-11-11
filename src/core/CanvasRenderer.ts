import type {Container} from "@scene/Container.ts";
import {CacheEntry} from "../cache/CacheEntry.ts";

interface ICommands {

}
export class CanvasRenderer {


  private _context: CanvasRenderingContext2D;
  private _batch : ICommands[];
  private _root: Container;

  private _cache: Map<string,CacheEntry>
  constructor(canvas: HTMLCanvasElement) {
    this._context = canvas.getContext('2d');
    this._batch = [];
  }

  public draw(image,x,y,width,height) {
    this._batch.push({image,x,y,width,height});
  }

  public flush() {
    const ctx = this._context;
    ctx.clearRect(0,0, ctx.canvas.width,ctx.canvas.height);

  }

  public get root(): Container {
    return this._root;
  }

  public set root(root: Container) {
    this._root = root;
  }
}


