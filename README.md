# paper.js


A Canvas2D rendering + asset library built for RPG Paper Maker.

## documentation
https://cartogrtaphergames.github.io/paper.js/

## AssetManager

`AssetManager` queues, loads, and caches assets by key. A default instance is exported as `Assets`.

### Registering loaders

Only the `"json"` loader is registered by default. Any other asset type (e.g. textures) needs its loader registered once, up front:

```ts
import { Assets, Texture2DLoader } from 'paper.js';

Assets.registerLoader('texture2D', new Texture2DLoader());
```

### Base path

Relative URLs passed to `add()` are resolved against a base path (absolute URLs are left untouched):

```ts
Assets.basePath = 'assets/'; // or pass it to the AssetManager constructor
```

### Queueing and loading

`add()` queues one or more assets without fetching anything yet. `load()` actually fetches them:

```ts
Assets.add({ key: 'hero', url: 'myHero.png', type: 'texture2D' });

const texture = await Assets.load('hero');
```

`load()` also accepts an array of keys, or no argument at all to load everything currently queued:

```ts
const all = await Assets.load(['hero', 'enemy', 'config']);
// or
const all = await Assets.load(); // loads every queued asset
```

Loading the same key again returns the cached result instead of re-fetching — `exists(key)` tells you whether a key is already cached.

### Releasing a texture

Assets are owner-tracked, not just refcounted: a `Texture2D` becomes an owner of its underlying `TextureSource` as soon as it's assigned one, and nothing removes that ownership automatically. Call `dispose()` on the `Texture2D` once you're actually done with it:

```ts
texture.dispose();
```

Until something disposes it, the cache considers it in use and won't evict it, even if it's gone idle. See [`docs/CacheSystem.md`](./docs/CacheSystem.md) for how the idle-sweep and ownership tracking work underneath this.
