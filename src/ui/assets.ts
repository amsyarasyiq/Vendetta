import { Asset } from "@types";
import { assets } from "@metro/common";
import { instead } from "@lib/patcher";

export const all: Record<string, Asset> = window.__pyonModuleCache?.assets ?? {};
const nameToId: Record<string, number> = {};

export function patchAssets() {
    const unpatch = instead("registerAsset", assets, ([asset], orig) => {
        if (!asset) return undefined;
        if (nameToId[asset.name]) return nameToId[asset.name];

        all[asset.name] = asset;
        return nameToId[asset.name] = orig(asset);
    });

    for (let id = 1; ; id++) {
        const asset = assets.getAssetByID(id);
        if (!asset) break;
        if (all[asset.name]) continue;
        all[asset.name] = asset;
        nameToId[asset.name] = id; 
    };

    return unpatch;
}

export const find = (filter: (a: any) => void): Asset | null | undefined => Object.values(all).find(filter);
export const getAssetByName = (name: string): Asset => all[name];
export const getAssetByID = (id: number): Asset => assets.getAssetByID(id);
export const getAssetIDByName = (name: string) => nameToId[name] ??= assets.registerAsset(all[name]);