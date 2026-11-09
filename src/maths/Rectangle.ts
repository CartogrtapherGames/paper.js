/*
    RPG Paper Maker Copyright (C) 2017-2026 Wano

    RPG Paper Maker engine is under proprietary license.
    This source code is also copyrighted.

    Use Commercial edition for commercial use of your games.
    See RPG Paper Maker EULA here:
        http://rpg-paper-maker.com/index.php/eula.
*/


import type { RectData } from './RectData';

/**
 * Represents a rectangle defined by its position and dimensions.
 */
export class Rectangle implements RectData {
	private _x: number;
	private _y: number;
	private _width: number;
	private _height: number;

	constructor(
		x: number = 0,
		y: number = 0,
		width: number = 1,
		height: number = 1
	) {
		this._x = x;
		this._y = y;
		this._width = width;
		this._height = height;
	}

	public get x(): number {
		return this._x;
	}

	public set x(value: number) {
		this._x = value;
	}

	public get y(): number {
		return this._y;
	}

	public set y(value: number) {
		this._y = value;
	}

	public get width(): number {
		return this._width;
	}

	public set width(value: number) {
		this._width = value;
	}

	public get height(): number {
		return this._height;
	}

	public set height(value: number) {
		this._height = value;
	}

	/**
	 * Creates a rectangle from an array of four numbers:
	 * [x, y, width, height].
	 */
	public static fromArray(
		array: [number, number, number, number]
	): Rectangle {
		return new Rectangle(...array);
	}

	/**
	 * Creates a rectangle with zero dimensions.
	 */
	public static empty(): Rectangle {
		return new Rectangle(0, 0, 0, 0);
	}

	/**
	 * Updates the rectangle's dimensions.
	 */
	public resize(width: number, height: number): this {
		this._width = width;
		this._height = height;

		return this;
	}

	/**
	 * Calculates the rectangle's area.
	 */
	public calculateArea(): number {
		return this._width * this._height;
	}

	/**
	 * Calculates the rectangle's perimeter.
	 */
	public calculatePerimeter(): number {
		return 2 * (this._width + this._height);
	}

	/**
	 * Sets the rectangle's position and dimensions.
	 */
	public set(
		x: number,
		y: number,
		width: number,
		height: number
	): this {
		this._x = x;
		this._y = y;
		this._width = width;
		this._height = height;

		return this;
	}

	/**
	 * Copies the position and dimensions from another rectangle.
	 */
	public copyFrom(rect: RectData): this {
		this._x = rect.x;
		this._y = rect.y;
		this._width = rect.width;
		this._height = rect.height;

		return this;
	}

	/**
	 * Checks whether a point is inside the rectangle.
	 * Left and top edges are inclusive; right and bottom edges are exclusive.
	 */
	public isInside(x: number, y: number): boolean {
		return (
			x >= this._x &&
			x < this._x + this._width &&
			y >= this._y &&
			y < this._y + this._height
		);
	}

	/**
	 * Creates an independent copy of this rectangle.
	 */
	public clone(): Rectangle {
		return new Rectangle(
			this._x,
			this._y,
			this._width,
			this._height
		);
	}
}

