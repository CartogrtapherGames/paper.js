import type { PointData } from './PointData';


export class Point implements PointData {
	public x = 0;
	public y = 0;

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	public set (x: number, y: number): Point {
		this.x = x;
		this.y = y;
		return this;
	}
	public static fromArray(array: [number,number] | number[]): Point {
		return new Point(...array);
	}

	public copyFrom(point: PointData): this {
		this.x = point.x;
		this.y = point.y;

		return this;
	}

	public clone(): Point {
		return new Point(this.x, this.y);
	}

	public static zero(): Point {
		return new Point(0,0);
	}
}
