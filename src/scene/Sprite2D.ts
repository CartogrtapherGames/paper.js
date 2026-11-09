import { Texture2D } from '@assets/Texture2D';
import { Point } from '@maths/Point';
import { BitmapSource } from '@assets/BitmapSource';
import { ImageSource } from '@assets/ImageSource';
import type { Drawable } from './Drawable';
import { DisplayObject2D } from './DisplayObject2D';

export type SpriteSources = BitmapSource | ImageSource;
/**
 * the class that display a 2D image on the screen.
 */
export class Sprite2D  extends DisplayObject2D implements Drawable {

	protected _texture: Texture2D<SpriteSources>;
	protected _position: Point; // technically it should be observable point but no sure yet.
	protected _scale: Point;
	protected _anchor: Point;
	protected _rotation: number;
	protected _scaleMode: number;
	//protected _visible: boolean;


	public isRoot(): boolean {
		return false;
	}
	protected static _emptyTexture: Texture2D<SpriteSources>  =  Texture2D.empty();

	constructor (context: CanvasRenderingContext2D, texture?: Texture2D) {
		super(context);
		if(texture) {
			this._texture = texture;
			this.markDirty();
		}
	}

	public get texture(){
		return this._texture;
	}

	public set texture(value: Texture2D<SpriteSources>) {
		if(this.texture == value) return;
		const oldtexture = this._texture;
		oldtexture.release();
		this.texture = value;
		this.texture.addRef();

	}

	draw(ctx: CanvasRenderingContext2D): void {

		if(!this._visible) return; // in this case we wouldnt render the  object. later on it will be transfered to the displayObject class.
		/// in this context we would draw the context it has to be implemented.
	}

}
