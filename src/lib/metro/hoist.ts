// Hoist required modules
// This used to be in filters.ts, but things became convoluted

import { getThemeColorMap, getThemeColors, getUnsafeColors } from "../themes";

// Early find logic
const basicFind = (prop: string) => Object.values(window.modules).find(m => m.publicModule.exports?.[prop]).publicModule.exports;

// Hoist React on window
window.React = basicFind("createElement") as typeof import("react");;

// Export ReactNative
export const ReactNative = basicFind("Text") as typeof import("react-native");

// Export Discord's constants
export const constants = basicFind("ThemeColorMap");

// Export moment
export const moment = basicFind("isMoment");

if (window.__vendetta_loader?.features.unfreezeColorConstants) {
    // returns a 0xRRGGBBAA 32bit int
    function normalizeColor(color: string): number {
        const processed = Number(ReactNative.processColor(color));
        return ((processed & 0x00ffffff) << 8 | processed >>> 24) >>> 0;
    }

    const { RawColor, SemanticColor, SemanticColorsByThemeTable } = basicFind("SemanticColorsByThemeTable");
    const mapToIndex = (key: string) => SemanticColor[key] ? Number(SemanticColor[key]) >>> 0 : -1;

    const newThemeColorMap = getThemeColorMap();
    const newRawColors = getThemeColors();
    const newUnsafeColors = getUnsafeColors();

    for (const key in newThemeColorMap) {
        const index = mapToIndex(key);
        if (index === -1) continue;

        for (let i = 0; i < newThemeColorMap[key].length; i++) {
            const isString = typeof SemanticColorsByThemeTable[i][index] === "string";
            const newValue = !isString ? normalizeColor(newThemeColorMap[key][i]!!) : newThemeColorMap[key][i];

            SemanticColorsByThemeTable[i][index] = newValue;
            constants.ThemeColorMap[key][i] = newThemeColorMap[key][i]; // not required, but overwrite it anyway
        }
    }

    for (const key in newRawColors) {
        // not required, but overwrite it anyway
        if (constants.Colors[key]) {
            constants.Colors[key] = newRawColors[key];
        }
        if (RawColor[key]) {
            const isString = typeof RawColor[key] === "string";
            RawColor[key] = !isString ? normalizeColor(newRawColors[key]) : newRawColors[key];
        }
    }

    for (const key in newUnsafeColors) {
        if (constants.UNSAFE_Colors[key]) {
            constants.UNSAFE_Colors[key] = newUnsafeColors[key];
        }
    }
}
