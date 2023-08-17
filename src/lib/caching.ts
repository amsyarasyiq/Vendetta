import { ModuleCache } from "@/def";

const MMKVManager = window.nativeModuleProxy.MMKVManager as any;

window.ErrorUtils.setGlobalHandler(() => {});

const metroRequire = (id: any) => {
    try {
        return window.__r(id);
    } catch {
        return undefined;
    }
};

const currentVersion = window.nativeModuleProxy.RTNClientInfoManager.Build;

const commonName = new Set([
    "__esModule",
    "constructor",
    "default",
    "initialize",
    "$$typeof",
    "compare",
    "type",
    "ddd",
    "assets",
    "layers",
    "markers",
    "displayName",
    "render",
    "defaultProps",
    "_default",
    ...Reflect.ownKeys(() => void 0)
]);

const blacklistedModules = [
    ["heart_eyes", "star_struck", "kissing_heart"],
    ["application/3gpp-ims+xml", "application/a2l"]
];

const __exports = new Set();

function __cache(obj: any, cache: ModuleCache<string[]>, isDefault = false) {
    if (isDefault) {
        // @ts-ignore
        cache = (cache.default) ??= {} as ModuleCache<string[]>;
    }

    if (__exports.has(obj)) return;
    else __exports.add(obj);

    for (const blacklistedProps of blacklistedModules) {
        if (blacklistedProps.every(p => p in obj)) return;
    }

    cache.props = Object.getOwnPropertyNames(obj);

    if (obj.constructor !== Object && obj.constructor !== Function && obj.__proto__) {
        cache.protoProps = Object.getOwnPropertyNames(obj.__proto__);
    }

    if (typeof obj === "function") {
        if (isNameValid(obj.name)) cache.name = obj.name;
        if (obj.prototype) cache.classProtoProps = Object.getOwnPropertyNames(obj.prototype);
        if (obj.displayName) cache.displayName = obj.displayName;
        if (obj.defaultProps) cache.compDefaultProps = Object.getOwnPropertyNames(obj.defaultProps);
    }

    if (obj.$$typeof) {
        if (obj.type?.name) cache.memoName = obj.type.name;
        if (obj.render?.name) cache.forwardRefName = obj.render.name;
        if (obj.Provider) delete cache.props; // React contexts are mostly unnamed
    }

    if (obj._dispatcher && obj.getName) {
        cache.fluxStoreName = obj.getName();
        // '_dispatcher' is usually used as store determiner, other props are pretty much useless
        cache.props = ["_dispatcher"];
    }

    if (!isDefault && isValidExports(obj.default) && obj.default !== obj) {
        __cache(obj.default, cache, true);
    }

    // i hate typescript.
    const _cache = cache as any;
    for (const key in cache) {
        if (_cache[key] instanceof Array) {
            _cache[key] = _cache[key].filter(isNameValid);
            if (_cache[key].length === 0) delete _cache[key];
        } else if (typeof _cache[key] === "string") {
            if (!isNameValid(_cache[key])) {
                delete _cache[key];
            }
        }
    }
}

function isNameValid(name: string) {
    return name && name.length > 2 && !commonName.has(name) && isNaN(Number(name));
}

function isValidExports(exp: any): boolean {
    if (exp == null || exp === window || exp["bye, proxier"] === null) return false;
    if (typeof exp !== "object" && typeof exp !== "function") return false;

    return true;
}

function isCacheUseful(cache: ModuleCache<string[]>): boolean {
    const isValueMeaningful = (val: string | string[] | ModuleCache<string[]>): any => {
        if (val instanceof Array) return val.filter(s => isValueMeaningful(s)).length > 0;
        if (typeof val === "string") return val.length > 2;
        if (typeof val === "object") return isCacheUseful(val);
    };

    return Object.values(cache).filter(v => isValueMeaningful(v)).length > 0;
}

function createModuleCache(id: string) {
    const exports = metroRequire(id);
    const cache = {} as ModuleCache<string[]>;

    if (isValidExports(exports)) {
        __cache(exports, cache);
    }

    return isCacheUseful(cache) ? cache : void 0;
}

async function cacheAndRestart() {
    console.log("Cache is unavailable or is outdated, caching and restarting!");

    const c = { version: currentVersion, assets: {} as any };

    const assetManager = Object.values(window.modules).find(m => m.publicModule.exports.registerAsset);
    assetManager.publicModule.exports.registerAsset = (asset: { name: string | number }) => {
        c.assets[asset.name] = asset;
    };

    for (const key in window.modules) {
        const cache = createModuleCache(key);
        // @ts-ignore - AHHHHHHHHHHHHHH
        if (cache != null) c[key] = cache;
    }

    MMKVManager.removeItem("pyonModuleCache");
    MMKVManager.setItem("pyonModuleCache", JSON.stringify(c));

    // setTimeout or setInterval isn't working!!
    // So, I can't guarantee that our cache is properly set (assuming setItem is actually async)
    setImmediate(window.nativeModuleProxy.BundleUpdaterManager.reload);
}

async function loadCacheOrRestart() {
    const loadedCache = await MMKVManager.getItem("pyonModuleCache");
    if (loadedCache == null) return void cacheAndRestart();

    const parsedCache = JSON.parse(loadedCache);
    if (parsedCache.version !== currentVersion) {
        return void cacheAndRestart();
    }

    delete parsedCache.version;
    return parsedCache;
}

export default () => loadCacheOrRestart().then(cache => {
    window.__pyonModuleCache = cache;

    for (const key in window.modules) if (cache[key]) {
        window.modules[key].__pyonCache = cache[key];

        const makeArrayToSets = (c: any) => {
            for (const k in c) {
                c[k] instanceof Array && (c[k] = new Set(c[k]));
            }

            if (c.default) makeArrayToSets(c.default);
        };

        makeArrayToSets(cache[key]);
    }

    return cache;
});
