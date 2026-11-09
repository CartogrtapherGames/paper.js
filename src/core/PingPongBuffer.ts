export interface PingPongBufferOptions {
  width: number
  height: number
}

/**
 * A ping-pong buffer for canvas2D render-to-texture operations.
 * Maintains two offscreen canvases and alternates between them to avoid
 * read/write conflicts.
 *
 * @example
 * ```ts
 * const buffer = new PingPongBuffer({ width: 800, height: 600 })
 *
 * const target = buffer.getTargetContext()
 * // draw something into target
 * buffer.swap()
 *
 * const result = buffer.getSource() // an OffscreenCanvas
 * ctx.drawImage(result, 0, 0)
 * ```
 * @link https://en.wikipedia.org/wiki/Ping-pong_scheme
 */
export class PingPongBuffer {
  private readonly _canvasA: OffscreenCanvas
  private readonly _canvasB: OffscreenCanvas
  private readonly _ctxA: OffscreenCanvasRenderingContext2D
  private readonly _ctxB: OffscreenCanvasRenderingContext2D

  private _current: 'A' | 'B' = 'A'

  constructor({ width, height }: PingPongBufferOptions) {
    this._canvasA = new OffscreenCanvas(width, height)
    this._canvasB = new OffscreenCanvas(width, height)
    this._ctxA = getContext2d(this._canvasA)
    this._ctxB = getContext2d(this._canvasB)
  }

  /**
   * Gets the current source canvas (read from this).
   */
  getSource(): OffscreenCanvas {
    return this._current === 'A' ? this._canvasA : this._canvasB
  }

  /**
   * Gets the current target canvas (write to this).
   * @deprecated theres no use to not use this for the time being use {@link getTargetContext|}
   */
  getTarget(): OffscreenCanvas {
    return this._current === 'A' ? this._canvasB : this._canvasA
  }

  /**
   * Gets the 2D context of the current source canvas.
   */
  getSourceContext(): OffscreenCanvasRenderingContext2D {
    return this._current === 'A' ? this._ctxA : this._ctxB
  }

  /**
   * Gets the 2D context of the current target canvas.
   */
  getTargetContext(): OffscreenCanvasRenderingContext2D {
    return this._current === 'A' ? this._ctxB : this._ctxA
  }

  /**
   * Swaps the source and target canvases.
   */
  swap(): void {
    this._current = this._current === 'A' ? 'B' : 'A'
  }

  /**
   * Clears the current source canvas to transparent.
   */
  clear(): void {
    const ctx = this.getSourceContext()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  /**
   * Clears both canvases to transparent.
   */
  clearAll(): void {
    this._ctxA.clearRect(0, 0, this._canvasA.width, this._canvasA.height)
    this._ctxB.clearRect(0, 0, this._canvasB.width, this._canvasB.height)
  }

  /**
   * Resizes both canvases. Note this clears their contents, same as a
   * regular canvas.
   */
  resize(width: number, height: number): void {
    this._canvasA.width = width
    this._canvasA.height = height
    this._canvasB.width = width
    this._canvasB.height = height
  }
}

function getContext2d(canvas: OffscreenCanvas): OffscreenCanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context not supported')
  return ctx
}
