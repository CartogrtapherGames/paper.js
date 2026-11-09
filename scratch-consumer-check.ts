import { Rectangle, Texture2D } from './dist/index'

const r: Rectangle = new Rectangle()
console.log(r)

const t: Texture2D<any> = Texture2D.empty()
console.log(t.frame)
