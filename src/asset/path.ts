/*
asset/path - path and url helpers
Part of Stardazed
(c) 2015-Present by @zenmumbler
https://github.com/stardazed/stardazed
*/

export function fileExtensionOfURL(url: URL | string): string {
	const path = (url instanceof URL) ? url.href : url;
	const lastDot = path.lastIndexOf(".");
	if (lastDot > -1) {
		return path.substr(lastDot + 1).toLowerCase();
	}
	return "";
}

export function resolveRelativePath(relPath: string, basePath: string) {
	return (new URL(relPath, "file:///" + basePath)).pathname.slice(1);
}
