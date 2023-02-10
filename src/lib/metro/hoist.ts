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
    const { RawColor, SemanticColor, SemanticColorsByThemeTable } = basicFind("SemanticColorsByThemeTable");
    const mapToIndex = (key: string) => SemanticColor[key] ? Number(SemanticColor[key]) >>> 0 : -1;

    const newThemeColorMap = getThemeColorMap();
    const newRawColors = getThemeColors();
    const newUnsafeColors = getUnsafeColors();

    for (const key in newThemeColorMap) {
        const index = mapToIndex(key);
        if (index === -1) continue;

        for (let i = 0; i < newThemeColorMap[key].length; i++) {
            SemanticColorsByThemeTable[i][index] = newThemeColorMap[key][i];
            // not required, but overwrite it anyway
            constants.ThemeColorMap[key][i] = newThemeColorMap[key][i];
        }
    }

    for (const key in newRawColors) {
        // not required, but overwrite it anyway
        if (constants.Colors[key]) {
            constants.Colors[key] = newRawColors[key];
        }
        if (RawColor[key]) {
            RawColor[key] = newRawColors[key];
        }
    }

    for (const key in newUnsafeColors) {
        if (constants.UNSAFE_Colors[key]) {
            constants.UNSAFE_Colors[key] = newUnsafeColors[key];
        }
    }
}
