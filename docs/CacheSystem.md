## The cache System

```ts

Assets.add({key: "hero", url: "mySubFolder/myHero.png", type: "texture2D"});

const texture = await Assets.load("hero");

const sprite = new Sprite2D(texture);

sprite.dispose(); // will automatically remove the references for the sprite
```

Texture Source in paper.js are owner based meaning that the cache will keep track of the owners. it is somewhat
smarter but it is still your responsability of making sure to unload those object. however sprites
are automatically GC on scene closure.

## How it works

There are three pieces involved: `AssetCache` (the map of cached resources), `CacheEntry` (per-resource
bookkeeping), and the resource itself (e.g. a `TextureSource`). They're deliberately split so that nothing
outside the cache needs to know the cache exists.

### Ownership is event-based, not a list the resource keeps itself

A `TextureSource` doesn't hold its own list of owners. It just emits two events:

```ts
textureSource.addOwner(someOwner);    // emits "addOwner"
textureSource.removeOwner(someOwner); // emits "removeOwner"
```

`CacheEntry` subscribes to both when it's created, and is the one actually keeping the `Set` of current
owners:

```ts
public hasOwners(): boolean {
  return this._owners.size > 0;
}
```

This means anything that wants to "own" a resource (right now: `Texture2D`) only ever talks to the resource
it already has a reference to — it never needs to reach into `AssetCache`/`CacheEntry` directly to register
or release that ownership.

### Eviction is time-based, not refcount-based

A resource doesn't get unloaded the instant its last owner lets go. Instead, `CacheEntry` tracks when it was
last "touched":

```ts
public isInactive(): boolean {
  return performance.now() > this._lastActivity + MAX_IDLE_TIME; // ~6 minutes
}

public isSafeToUnload(): boolean {
  return !this.hasOwners() && this.isInactive();
}
```

`touch()` runs automatically whenever an owner is added/removed, or whenever something reads the entry from
the cache (`AssetManager` calls it on a cache hit). So a resource only becomes eligible for eviction once
it has **no owners and hasn't been touched in ~6 minutes** — giving something briefly released and
re-requested a grace period instead of being destroyed and immediately reloaded.

`AssetCache.startSweeping()` runs a `setInterval` (default: every half of that idle window) that walks every
cached entry and unloads whatever `isSafeToUnload()` says is safe:

```ts
private sweep(){
  for(const [key, entry] of this._cache) {
    if(entry.isTransient()) continue;
    if(entry.isSafeToUnload()) this.unload(key);
  }
}
```

### Transient entries never get swept

Calling `cacheEntry.markTransient()` opts a resource out of the sweep entirely, regardless of owners or idle
time. Use this for anything that should stay loaded for the lifetime of the app (e.g. UI atlases) rather than
being treated as evictable.

### `Texture2D` has its own, separate lifecycle

`Texture2D.addRef()` / `Texture2D.dispose()` manage a *different* refcount — how many things hold that
particular `Texture2D` wrapper (sprites, etc.), not how many things own the shared `TextureSource`
underneath it. When a `Texture2D`'s own refcount hits zero, it calls `destroy()`, which calls
`removeOwner(this)` on its `TextureSource` — that's the one and only point where the two layers connect.

### Debugging

`AssetCache.debug()` (and `AssetManager.debug()`, which also prints registered loaders and queued keys)
dumps a live snapshot of every cached entry — owners, transient flag, and how long it's been idle:

```ts
Assets.debug();
```

### Known gaps right now

- Nothing currently calls `removeOwner` when a `Sprite2D` itself is disposed — only swapping a sprite's
  `texture` releases the old one. `Sprite2D` is still WIP, so this isn't wired up yet.
