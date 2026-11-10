import { Rectangle } from '@maths/Rectangle';
import { TextureSource } from './TextureSource';

/**
 * the data class that manage textures for UI and 2D visual elements on the screen.
 */
export class Texture2D<T extends TextureSource<any> = TextureSource<any>> {

	protected _textureSource: T | null = null;
	protected _width: number;
	protected _height: number;
	protected _frame: Rectangle | null;
	private _destroyed = false;
	protected _refCount: number = 0;


	public get refCount(): number {
		return this._refCount;
	}
	constructor(textureSource: T | null = null ) {
		this._width = 0;
		this._height = 0;
		this._frame = Rectangle.empty();
		if (textureSource) {
			this.textureSource = textureSource; // routes through the setter so addRef() actually runs
		}
	}

	static empty(): Texture2D<TextureSource<any>> {
		return new Texture2D();
	}
	/**
	 * the texture source
	 * @readonly
	 */
	public get textureSource(): T | null {
		return this._textureSource;
	}

	public set textureSource(value: T) {
		if(this._textureSource === value) return;
		if(this._textureSource) this._textureSource.release();
		this._textureSource = value;
		this._textureSource.addRef();
	}

	/**
	 * the texture width
	 * @readonly
	 */
	public get width(): number {
		return this._textureSource?.width ?? 0;
	}

	/**
	 * the texture height
	 */
	public get height(): number {
		return this._textureSource?.height ?? 0;
	}

	/**
	 * the texture destination frame coordinates.
	 * its used to crop for texture frame.
	 */
	public get frame(): Rectangle | null {
		return this._frame;
	}

	public set frame(frame: Rectangle) {
		this._frame = frame;
	}

	public resize(width: number, height: number) {
		this._width = width;
		this._height = height;
		this.refresh();
	}


	protected refresh(){
		/// TODO later.
	}


	public isDisposed(): boolean {
		return this._destroyed;
	}

	public dispose(force = false){
		if(this.isDisposed()) return;
		if(force){
			this.destroy();
		} else {
			this._textureSource?.dispose();
		}
		this._textureSource = null;
		this._frame = null;
		this._destroyed = true;
	}

	protected destroy() {
		this._textureSource.dispose();
		this._textureSource = null;
		this._frame = null;
		this._destroyed = true;
	}
	public addRef(): this {
		this._refCount++;
		return this;
	}

	public release(): void {
		this._refCount--;
		if(this._refCount <= 0){
			this.dispose();
		}
	}


}
