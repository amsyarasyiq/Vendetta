import { ModuleCache, PropsFinder, PropsFinderAll } from "@types";
import { commonName } from "@lib/cacher";

// Metro require
declare const __r: (moduleId: string | number) => any;

const filterModules = (single = false) => (filter: (c: ModuleCache) => any) => {
    const found = new Array<any>;

    for (const key in modules) if (modules[key].__pyonCache) {
        const cache = modules[key].__pyonCache as ModuleCache;

        if (cache.default && filter(cache.default)) {
            if (single) return __r(key).default;
            found.push(__r(key).default);
        }

        if (filter(cache)) {
            if (single) return __r(key);
            found.push(__r(key));
        }
    }

    if (!single) return found;
}

export const findByCache = filterModules(true);
export const findByCacheAll = filterModules();

export const modules = window.modules;

const propsFilter = (props: string[]) => (c: ModuleCache) => props.every(p => commonName.has(p) ? true : c.props?.has(p) || c.protoProps?.has(p));
const nameFilter = (name: string, defaultExp = true) => defaultExp ? (c: ModuleCache) => c.name === name : (cache: ModuleCache) => cache.default?.name === name;
const dNameFilter = (displayName: string, defaultExp: boolean) => defaultExp ? (c: ModuleCache) => c.displayName === displayName : (c: ModuleCache) => c.default?.displayName === displayName;
const tNameFilter = (typeName: string, defaultExp: boolean) => defaultExp ? (c: ModuleCache) => c.memoName === typeName : (c: ModuleCache) => c.default?.memoName === typeName;
const storeFilter = (name: string) => (c: ModuleCache) => c.fluxStoreName === name;

export const findByProps: PropsFinder = (...props) => findByCache(propsFilter(props));
export const findByPropsAll: PropsFinderAll = (...props) => findByCacheAll(propsFilter(props));
export const findByName = (name: string, defaultExp = true) => findByCache(nameFilter(name, defaultExp));
export const findByNameAll = (name: string, defaultExp = true) => findByCacheAll(nameFilter(name, defaultExp));
export const findByDisplayName = (displayName: string, defaultExp = true) => findByCache(dNameFilter(displayName, defaultExp));
export const findByDisplayNameAll = (displayName: string, defaultExp = true) => findByCacheAll(dNameFilter(displayName, defaultExp));
export const findByTypeName = (typeName: string, defaultExp = true) => findByCache(tNameFilter(typeName, defaultExp));
export const findByTypeNameAll = (typeName: string, defaultExp = true) => findByCacheAll(tNameFilter(typeName, defaultExp));
export const findByStoreName = (name: string) => findByCache(storeFilter(name));

type FnFilter = (m: any) => boolean;

const findFilter = (filter: FnFilter) => (c: ModuleCache) => {
    const handler: ProxyHandler<any> = {
        get: (_, prop: string) => {
            if (prop === "name") return c.name;
            if (prop === "default" && c.default && (c = c.default)) return new Proxy({}, handler);
            if (prop === "render") return { name: c.forwardRefName };
            if (prop === "type") return { name: c.memoName };
            if (c.props?.has(prop) || c.protoProps?.has(prop)) return true;
        },
        ownKeys: () => c.props ? [...c.props] : [],
        getOwnPropertyDescriptor() {
            return { enumerable: true, configurable: true };
        }
    };

    return filter(new Proxy({}, handler))
}

/**
 * @deprecated Do not use! This exists merely to support Vendetta plugins!
 */
export const find = (filter: FnFilter) => findByCache(findFilter(filter));

/**
 * @deprecated Do not use! This exists merely to support Vendetta plugins!
 */
export const findAll = (filter: FnFilter) => findByCacheAll(findFilter(filter));