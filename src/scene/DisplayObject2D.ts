import type {Drawable} from './Drawable';
import  {Point} from "@maths/Point.ts";
import {ObservablePoint} from "@maths/ObservablePoint.ts";
import {clamp} from "@maths/clamp.ts";
import  {Rectangle} from "@maths/Rectangle.ts";


/**
 * the base class of all drawable 2D object in paper.js
 */
export abstract class DisplayObject2D implements Drawable {

  protected _isDirty: boolean = false;
  protected _position: ObservablePoint;
  protected _scale: ObservablePoint;
  protected _rotation: number;
  protected _origin: ObservablePoint;
  protected _visible: boolean;
  protected _isDisposed: boolean;
  protected _alpha: number;


  protected _worldTransform: DOMMatrix;
	protected _parent: DisplayObject2D;

  protected _context2D: CanvasRenderingContext2D;
  protected _children: DisplayObject2D[];

  protected _dirtyRects: Rectangle[]  = [];
  protected _lastWorldBounds : Rectangle | null = null;

  constructor(context2D: CanvasRenderingContext2D) {
    this._context2D = context2D;
    this.initMembers();
    this._parent = null;
    this._children = [];
  }

  protected initMembers() {
    this._position = ObservablePoint.zero(this.markDirty.bind(this));
    this._scale = ObservablePoint.zero(this.markDirty.bind(this));
    this._rotation = 0;
    this._origin = ObservablePoint.zero(this.markDirty.bind(this));
    this._visible = true;
    this._isDirty = true;
    this._alpha = 1;
    this._isDisposed = false;
  }


  public abstract isRoot(): boolean;

  public get worldTransform(): DOMMatrix {
    if(this._isDirty) this.updateWorldTransform();
    return this._worldTransform;
  }

  public set worldTransform(value: DOMMatrix) {
    this._worldTransform = value;
  }

  public get parent(): DisplayObject2D {
    return this._parent;
  }

  private set parent(value: DisplayObject2D) {
    this._parent = value;
  }
	public get children(): DisplayObject2D[] {
		return this._children;
	}

  public hasChildren(): boolean {
    return this._children.length > 0;
  }

  public get visible(): boolean {
    return this._visible;
  }


  public set visible(value: boolean) {
    this._visible = value;
    this.markDirty();
  }

  public get position(): ObservablePoint {
    return this._position;
  }

  public get x(): number {
    return this.position.x;
  }
  public set x(value: number) {
    this.position.x = value;
  }


  public get y(): number {
    return this.position.y;
  }
  public set y(value: number) {
    this.position.y = value;
  }

  public get scale(): ObservablePoint {
    return this._scale;
  }

  public get rotation(): number {
    return this._rotation;
  }

  public set rotation(value: number) {
    this._rotation = value;
    this.markDirty();
  }

  public get origin(): ObservablePoint {
    return this._origin;
  }

  public get alpha(): number {
    return this._alpha;
  }

  public set alpha(value: number) {
    this._alpha = clamp(value, 0, 1);
    this.markDirty();
  }

  public get worldAlpha(): number {
    return this.alpha * (this.parent?.worldAlpha ?? 1)
  }

  abstract getBounds(): Rectangle;

  get width(): number {
    return Math.abs(this._scale.x * this.getBounds().width);
  }

  set width(value: number) {
    const localWidth = this.getBounds().width;
    let sign = Math.sign(this._scale.x);
    if(sign === 0) sign = 1;
    if(localWidth !== 0) {
      this._scale.x = (value / localWidth) * sign;
    } else {
      this._scale.x = sign;
    }
  }

  get height(): number {
    return Math.abs(this._scale.y * this.getBounds().height);
  }

  set height(value: number) {
    const localHeight = this.getBounds().height;
    let sign = Math.sign(this._scale.y);
    if(sign === 0) sign = 1;
    if(localHeight !== 0) {
      this._scale.y = (value / localHeight) * sign;
    } else {
      this._scale.y = sign;
    }
  }

  public isDisposed(): boolean {
    return this._isDisposed;
  }

  public addChild(...children: DisplayObject2D[]) {
    for (const child of children) {
      child.parent = this;
      this._children.push(child);
      child.context2D = this._context2D;
      child.markDirty();
    }
  }

  public removeChild(...children: DisplayObject2D[]): void {
    for (const child of children) {
      const index = this._children.indexOf(child);
      if (index === -1) continue;

      child.requestPaint(); // report its current region as dirty WHILE still attached
      this._children.splice(index, 1);
      child.parent = null;
    }
  }
  getWorldBounds(): Rectangle {
    const local = this.getBounds()

    const corners: DOMPoint[] = [
      this.worldTransform.transformPoint({ x: local.x, y: local.y }),
      this.worldTransform.transformPoint({ x: local.x + local.width, y: local.y }),
      this.worldTransform.transformPoint({ x: local.x + local.width, y: local.y + local.height }),
      this.worldTransform.transformPoint({ x: local.x, y: local.y + local.height }),
    ]

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    for (const corner of corners) {
      minX = Math.min(minX, corner.x)
      minY = Math.min(minY, corner.y)
      maxX = Math.max(maxX, corner.x)
      maxY = Math.max(maxY, corner.y)
    }

    return new Rectangle(minX, minY, maxX - minX, maxY - minY)
  }


  public isDirty(): boolean {
    return this._isDirty;
  }
	public get context2D(): CanvasRenderingContext2D {
		return this._context2D;
	}

	public set context2D(value: CanvasRenderingContext2D) {
		this._context2D = value;
		this.reAssignContextToChildren();
	}

	private reAssignContextToChildren() {
		for (const child of this._children) {
			child.context2D = this._context2D;
		}
	}

  draw() {
    if (!this._visible) return; // in this case since its not visible, dont rending it.
    if (this._children) {
      for (const child of this._children) {
        if (!child._visible) continue;
        child.draw();
      }
    }
  }

  update(dt: number) {
    for (const child of this._children) {
      child.update(dt);
    }
  }

  protected markDirty() {
    this._isDirty = true;
    for (const child of this._children) {
      child.markDirty();
    }
    this.requestPaint();
  }

  protected updateWorldTransform(): void {
    const localTransform = new DOMMatrix()
        .translate(this._position.x, this._position.y)
        .rotate((this._rotation * 180) / Math.PI)
        .scale(this._scale.x, this._scale.y)
        .translate(-this._origin.x, -this._origin.y)

    this.worldTransform = this.parent
        ? this.parent.worldTransform.multiply(localTransform)
        : localTransform

    this._isDirty = false
  }

  protected decomposeMatrix2D(matrix: DOMMatrix): { position: Point; rotation: number; scale: Point } {
    const position = new Point(matrix.e, matrix.f)
    const scaleX = Math.hypot(matrix.a, matrix.b)
    const scaleY = Math.hypot(matrix.c, matrix.d)
    const rotation = Math.atan2(matrix.b, matrix.a)

    return { position, rotation, scale: new Point(scaleX, scaleY) }
  }


  dispose(){
    if(this._isDisposed) return;
    this.parent?.removeChild(this);
    for (const child of this._children) {
      child.dispose();
    }
    this._isDisposed = true;

  }
  requestPaint(){
    if(this.isRoot()) return;
    const bounds = this.getWorldBounds();
    if (this._lastWorldBounds) {
      this.parent?.onChildDirty(this._lastWorldBounds);
    }
    this.parent?.onChildDirty(bounds);
    this._lastWorldBounds = bounds;
  }

  protected onChildDirty(bounds: Rectangle) {
    if (this.isRoot()) {
      this._dirtyRects.push(bounds);
    } else {
      this.parent?.onChildDirty(bounds);
    }
  }
}
