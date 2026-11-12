/**
 * check whether a path is considered an absolute url or not
 * @param url - the url to scan
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) || url.startsWith('/') || url.startsWith('data:');
}
