import { TextureSource } from './TextureSource';


const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

export class ImageSource extends TextureSource<HTMLImageElement> {

	protected destroy(): void {
		this._resource.onload = null;
		this._resource.onerror = null;
		this._resource.src = TRANSPARENT_PIXEL;
		if(this._resource.parentNode) this._resource.remove();
		this._resource = null;
	}

}
