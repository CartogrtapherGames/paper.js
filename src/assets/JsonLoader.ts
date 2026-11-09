import type {AssetLoader} from "@assets/AssetLoader.ts";


export class JsonLoader implements  AssetLoader<object> {
    async load(url: string): Promise<object> {
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Failed to load json "${url}": ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
}
