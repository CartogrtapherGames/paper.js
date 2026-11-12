import type {AssetLoader} from "@assets/AssetLoader.ts";
import type {ResolvedAsset} from "@assets/ResolvedAsset.ts";


export class JsonLoader implements  AssetLoader<object> {

    get type(): string {
        return "json";
    }

    canCache(): boolean {
        return false;
    }

    async load(key: string, url: string): Promise<ResolvedAsset<object>> {
        const response = await fetch(url);
        if(!response.ok) {
            throw new Error(`Failed to load json "${url}": ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        return {
            key: key, // in this case we dont need a key?
            type: "json",
            source: json
        };
    }
}
