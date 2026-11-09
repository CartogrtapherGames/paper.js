
export interface AssetLoader<T> {
  canCache(): boolean;
  load(url: string): Promise<T>;
  create?(source: any) : any;
}
