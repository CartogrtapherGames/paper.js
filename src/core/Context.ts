import type { Drawable } from './Drawable.ts'

export class Context {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D

  width = 0
  height = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D context not supported')
    this.ctx = ctx

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize(width = window.innerWidth, height = window.innerHeight): void {
    const dpr = window.devicePixelRatio || 1

    this.width = width
    this.height = height

    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
  }

  draw(drawable: Drawable): void {
    drawable.draw(this.ctx)
  }
}
