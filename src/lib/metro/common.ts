import { DiscordStyleSheet } from "@types";
import type { StyleSheet } from "react-native";
import { findByCache, findByProps, findByStoreName } from "@metro/filters";

const ThemeStore = findByStoreName("ThemeStore");
const colorResolver = findByProps("colors", "meta").meta;

// Reimplementation of Discord's createThemedStyleSheet, which was removed since 204201
// Not exactly a 1:1 reimplementation, but sufficient to keep compatibility with existing plugins
function createThemedStyleSheet<T extends StyleSheet.NamedStyles<T>>(sheet: T) {
    for (const key in sheet) {
        // @ts-ignore
        sheet[key] = new Proxy(RN.StyleSheet.flatten(sheet[key]), {
            get(target, prop, receiver) { 
                const res = Reflect.get(target, prop, receiver);
                return colorResolver.isSemanticColor(res) 
                    ? colorResolver.resolveSemanticColor(ThemeStore.theme, res)
                    : res
            }
        });
    }

    return sheet;
}

// Discord
export const constants = findByProps("Fonts", "Permissions");
export const channels = findByProps("getVoiceChannelId");
export const i18n = findByProps("Messages");
export const url = findByProps("openURL", "openDeeplink");
export const toasts = findByCache(c => c.props?.has("open") && c.props?.has("close") && c.props?.size === 2);

// Compatible with pre-204201 versions since createThemedStyleSheet is undefined.
export const stylesheet = {
    ...findByCache(c => c.props?.has("createStyles") && !c.props.has("ActionSheet")),
    createThemedStyleSheet,
    ...findByProps("createThemedStyleSheet") as {},
} as DiscordStyleSheet;

export const clipboard = findByProps("setString", "getString", "hasString") as typeof import("@react-native-clipboard/clipboard").default;
export const assets = findByProps("registerAsset");
export const invites = findByProps("acceptInviteAndTransitionToInviteChannel");
export const commands = findByProps("getBuiltInCommands");
export const navigation = findByProps("pushLazy");
export const navigationStack = findByProps("createStackNavigator");
export const NavigationNative = findByProps("NavigationContainer");

// Flux
export const Flux = findByProps("connectStores");
export const FluxDispatcher = findByProps("_currentDispatchActionType");

// React
export const React = window.React as typeof import("react");
export const ReactNative = findByProps("AppRegistry") as typeof import("react-native");

// Moment
export const moment = findByProps("isMoment") as typeof import("moment");

// chroma.js
export const chroma = findByProps("brewer") as typeof import("chroma-js");

// Lodash
export const lodash = findByProps("forEachRight") as typeof import("lodash");

// The node:util polyfill for RN
// TODO: Find types for this
export const util = findByProps("inspect", "isNullOrUndefined");