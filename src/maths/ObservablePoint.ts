import type { PointData } from './PointData';
import { Point } from './Point';

type ObservablePointSnapshot = Pick<Point, 'x' | 'y' | 'clone'>;

export class ObservablePoint implements ObservablePointSnapshot, PointData {
	private _x: number;
	private _y: number;
	private readonly _onChange: () => void;

	constructor(onChange: () => void, x = 0, y = 0) {
		this._onChange = onChange;
		this._x = x;
		this._y = y;
	}

	get x(): number {
		return this._x;
	}

	set x(value: number) {
		if (value === this._x) return;
		this._x = value;
		this._onChange();
	}

	get y(): number {
		return this._y;
	}

	set y(value: number) {
		if (value === this._y) return;
		this._y = value;
		this._onChange();
	}

	public set(x: number, y: number): this {
		const changed = x !== this._x || y !== this._y;
		this._x = x;
		this._y = y;
		if (changed) this._onChange();
		return this;
	}

	public copyFrom(point: PointData): this {
		return this.set(point.x, point.y);
	}

	public clone(): Point {
		return new Point(this._x, this._y);
	}

  public static zero(onChange: () => void) : ObservablePoint {
    return new ObservablePoint(onChange, 0,0);
  }
}
