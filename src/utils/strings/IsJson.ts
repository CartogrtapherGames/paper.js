
/**
 * check whether the asset type is json via its extension.
 * @param str - the asset name to check
 */
export function isJson(str: string): boolean {
  return str.includes(".json");
}
