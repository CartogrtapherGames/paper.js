export interface ResolvedAsset<TSource = unknown> {
  key: string;
  source: TSource;
  type: string;
}
