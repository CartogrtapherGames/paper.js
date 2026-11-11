

export interface Disposable {
  dispose(force?: boolean): void;
  destroy(): void;
  isDisposed(): boolean;
}
