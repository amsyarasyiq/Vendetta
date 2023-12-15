import { DiscordStyleSheet } from "@types";
import { findByCache, findByProps } from "@metro/filters";

// Discord
export const constants = findByProps("Fonts", "Permissions");
export const channels = findByProps("getVoiceChannelId");
export const i18n = findByProps("Messages");
export const url = findByProps("openURL", "openDeeplink");
export const toasts = findByCache(c => c.props?.has("open") && c.props?.has("close") && c.props?.size === 2);
export const stylesheet = findByProps("createThemedStyleSheet") as DiscordStyleSheet;
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