import { TextureSource } from './TextureSource';


const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
 * the texture source class that implements Html Image elements
 * however the renderer will always try to use bitmapSource as its natural and will default to BitmapSource when loading.
 */
export class ImageSource extends TextureSource<HTMLImageElement> {

	public destroy(): void {
		this._resource.onload = null;
		this._resource.onerror = null;
		this._resource.src = TRANSPARENT_PIXEL;
		if(this._resource.parentNode) this._resource.remove();
		this._resource = null;
	}

}
