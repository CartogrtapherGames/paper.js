

export interface Emittable<Events extends Record<string, any> = Record<string, any>> {
  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void;
  off<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void): void;
  emit<K extends keyof Events>(event: K, payload: Events[K]): void;
}
