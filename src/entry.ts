import { ClientInfoManager } from "@lib/native";

// This logs in the native logging implementation, e.g. logcat
console.log("Hello from Vendetta!");

// Polyfill Promise.allSettled
Promise.allSettled = (values: any) => Promise.all(values).catch();

Object.freeze = Object;
Object.seal = Object;

const oldDefineProperty = Object.defineProperty;
// @ts-ignore
Object.defineProperty = function defineProperty(...args) {
    if (args[2].configurable == null && args[2].writable !== false) {
        args[2].configurable = true
    }
    
    return oldDefineProperty.apply(this, args)
};

(async () => {
    const initNow = performance.now();
    await (await import("./lib/caching")).default();

    await import(".").then((m) => m.default()).catch((e) => {
        console.log(e?.stack ?? e.toString());
        alert([
            "Failed to load (pyon-ified) Vendetta!\n",
            `Build Number: ${ClientInfoManager.Build}`,
            `Vendetta: ${__vendettaVersion}`,
            e?.stack || e.toString(),
        ].join("\n"));
    });

    console.log(`Pyondetta inited in ${performance.now() - initNow}ms`);
})();
