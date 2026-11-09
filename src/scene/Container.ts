import { DisplayObject2D } from './DisplayObject2D';
import { Rectangle } from '@maths/Rectangle.ts';

/**
 * the top of a scene graph. owns the dirty-rect compositor: accumulates
 * dirty regions reported by descendants via {@link onChildDirty} and, on
 * {@link renderFrame}, clears and redraws only what actually needs it.
 */
export class Container extends DisplayObject2D {

	public isRoot(): boolean {
		return this.parent === null;
	}
	getBounds(): Rectangle {
		const canvas = this.context2D.canvas;
		return new Rectangle(0, 0, canvas.width, canvas.height);
	}

	renderFrame(): void {
		if (this._dirtyRects.length === 0) return;

		const rect = this._mergeRects(this._dirtyRects);
		this._dirtyRects = [];

		this.context2D.clearRect(rect.x, rect.y, rect.width, rect.height);
		this._repaintIntersecting(this, rect);
	}

	private _mergeRects(rects: Rectangle[]): Rectangle {
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const r of rects) {
			minX = Math.min(minX, r.x);
			minY = Math.min(minY, r.y);
			maxX = Math.max(maxX, r.x + r.width);
			maxY = Math.max(maxY, r.y + r.height);
		}
		return new Rectangle(minX, minY, maxX - minX, maxY - minY);
	}

	private _intersects(a: Rectangle, b: Rectangle): boolean {
		return a.x < b.x + b.width && a.x + a.width > b.x
			&& a.y < b.y + b.height && a.y + a.height > b.y;
	}

	private _repaintIntersecting(node: DisplayObject2D, rect: Rectangle): void {
		if (!node.visible) return;
		if (this._intersects(node.getWorldBounds(), rect)) {
			node.draw(); // draw() already recurses into this node's children
			return;
		}
		for (const child of node.children) {
			this._repaintIntersecting(child, rect);
		}
	}
}
