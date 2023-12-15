const lazySymbol = Symbol.for("vendetta.metro.lazy");

const unconfigurable = new Set(["arguments", "caller", "prototype"]);
const isUnconfigurable = (key: PropertyKey) => typeof key === "string" && unconfigurable.has(key);

const lazyHandler: ProxyHandler<any> = {
    ...Object.fromEntries(Object.getOwnPropertyNames(Reflect).map(fnName => {
        return [fnName, (target: any, ...args: any[]) => {
            return Reflect[fnName](target[lazySymbol].value, ...args);
        }];
    })),
    ownKeys: target => {
        const cacheKeys = Reflect.ownKeys(target[lazySymbol].value);
        unconfigurable.forEach(key => isUnconfigurable(key) && cacheKeys.push(key));
        return cacheKeys;
    },
    getOwnPropertyDescriptor: (target, p) => {
        if (isUnconfigurable(p)) return Reflect.getOwnPropertyDescriptor(target, p);

        const descriptor = Reflect.getOwnPropertyDescriptor(target[lazySymbol].value, p);
        if (descriptor) Object.defineProperty(target, p, descriptor);
        return descriptor;
    },
};

class LazyModule<T> {
    #cache?: T;

    constructor(private factory: () => T) {}

    get value() { 
        return this.#cache ??= this.factory(); 
    }
    
    makeProxy() {
        return new Proxy(
            Object.assign(() => void 0, { [lazySymbol]: this }),
            lazyHandler
        )
    }
} 

export default function lazyModule<T>(factory: () => T): T {
    return new LazyModule(factory).makeProxy();
}