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

const exec = async <T extends Promise<any>>(importer: T) => await importer.then(d => d.default());

(async () => {
    const initNow = window.__pyon_init_now = performance.now();
    
    // Export our beloved modules
    for (const key in window.modules) {
        const exports = window.modules[key]?.publicModule.exports;
        if (exports?.createElement) window.React = exports;
    }

    // Cache -> themes -> playground -> main bundle
    await exec(import("./lib/cacher"));
    await exec(import("./lib/themes"));
    await exec(import("./playground"));
    await exec(import(".")).catch((e) => {
        console.log(e?.stack ?? e.toString());
        alert([
            "Failed to load (pyon-ified) Vendetta!\n",
            `Build Number: ${ClientInfoManager.Build}`,
            `Vendetta: ${__vendettaVersion}`,
            e?.stack || e.toString(),
        ].join("\n"));
    });

    console.log(`Vendetta inited in ${performance.now() - initNow}ms`);
})();
