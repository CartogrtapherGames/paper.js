import type {Container} from "@scene/Container.ts";
import type {TextureSource} from "@assets/TextureSource.ts";
import type {Drawable} from "@core/Drawable.ts";

interface ICommands {

}
export class CanvasRenderer {


  private _context: CanvasRenderingContext2D;
  private _batch : ICommands[];
  private _root: Container;

  private _cache: Map<string,TextureCache>
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
// Roughly 6 mins
const MAX_IDLE_TIME = 360000;

export class TextureCache {

  public source: TextureSource<any>;
  public owners: Set<Drawable>;
  public timestamp: number;

  public touch(){
    this.timestamp = performance.now();
  }

  public isInactive(): boolean {
    const currentTime = performance.now();
    return currentTime > this.timestamp + MAX_IDLE_TIME
  }
  public hasOwners(): boolean {
    return !!this.owners;
  }

  public isSafeToUnload(): boolean {
    return !this.hasOwners() && this.isInactive();
  }
  public addOwner(owner: Drawable): void {
    this.owners.add(owner);
  }
  public removeOwner(owner: Drawable): void {
    this.owners.delete(owner);
  }
}
