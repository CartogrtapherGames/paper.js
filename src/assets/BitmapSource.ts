import { TextureSource } from "./TextureSource.ts";

export class BitmapSource extends TextureSource<ImageBitmap> {

	/// TODO : should have some specific stuff to do here but I am drawing a blank on this one.

	protected destroy() {
		this._resource?.close();
		this._resource = null;
		this._destroyed = true;
	}
}
