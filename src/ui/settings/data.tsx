import { ReactNative as RN, NavigationNative, stylesheet, lodash } from "@metro/common";
import { installPlugin } from "@lib/plugins";
import { installTheme } from "@lib/themes";
import { showConfirmationAlert } from "@ui/alerts";
import { semanticColors } from "@ui/color";
import { showToast } from "@ui/toasts";
import { without } from "@lib/utils";
import { getAssetIDByName } from "@ui/assets";
import settings from "@lib/settings";
import { PROXY_PREFIX } from "@lib/constants";

const ErrorBoundary = React.lazy(() => import("@ui/components/ErrorBoundary"));
const InstallButton = React.lazy(() => import("@ui/settings/components/InstallButton"))

interface Screen {
    [index: string]: any;
    key: string;
    title: string;
    icon?: string;
    shouldRender?: () => boolean;
    options?: Record<string, any>;
    render: React.ComponentType<any>;
}

const styles = stylesheet.createThemedStyleSheet({ container: { flex: 1, backgroundColor: semanticColors.BACKGROUND_MOBILE_PRIMARY } });
const formatKey = (key: string, youKeys: boolean) => youKeys ? lodash.snakeCase(key).toUpperCase() : key;
// If a function is passed, it is called with the screen object, and the return value is mapped. If a string is passed, we map to the value of the property with that name on the screen. Else, just map to the given data.
// Question: Isn't this overengineered?
// Answer: Maybe.
const keyMap = (screens: Screen[], data: string | ((s: Screen) => any) | null) => Object.fromEntries(screens.map(s => [s.key, typeof data === "function" ? data(s) : typeof data === "string" ? s[data] : data]));

export const getScreens = (youKeys = false): Screen[] => [
    {
        key: formatKey("VendettaSettings", youKeys),
        title: "General",
        icon: "settings",
        render: React.lazy(() => import("@ui/settings/pages/General")),
    },
    {
        key: formatKey("VendettaPlugins", youKeys),
        title: "Plugins",
        icon: "debug",
        options: {
            headerRight: () => (
                <InstallButton
                    alertTitle="Install Plugin"
                    installFunction={async (input) => {
                        if (!input.startsWith(PROXY_PREFIX) && !settings.developerSettings)
                            setImmediate(() => showConfirmationAlert({
                                title: "Unproxied Plugin",
                                content: "The plugin you are trying to install has not been proxied/verified by Vendetta staff. Are you sure you want to continue?",
                                confirmText: "Install",
                                onConfirm: () =>
                                    installPlugin(input)
                                        .then(() => showToast("Installed plugin", getAssetIDByName("Check")))
                                        .catch((x) => showToast(x?.message ?? `${x}`, getAssetIDByName("Small"))),
                                cancelText: "Cancel",
                            }));
                        else return await installPlugin(input);
                    }}
                />
            ),
        },
        render: React.lazy(() => import("@ui/settings/pages/Plugins")),
    },
    {
        key: formatKey("VendettaThemes", youKeys),
        title: "Themes",
        icon: "ic_theme_24px",
        // TODO: bad
        shouldRender: () => window.__vendetta_loader?.features.hasOwnProperty("themes") ?? false,
        options: {
            headerRight: () => !settings.safeMode?.enabled && <InstallButton alertTitle="Install Theme" installFunction={installTheme} />,
        },
        render: React.lazy(() => import("@ui/settings/pages/Themes")),
    },
    {
        key: formatKey("VendettaDeveloper", youKeys),
        title: "Developer",
        icon: "ic_progress_wrench_24px",
        shouldRender: () => settings.developerSettings ?? false,
        render: React.lazy(() => import("@ui/settings/pages/Developer")),
    },
    {
        key: formatKey("VendettaCustomPage", youKeys),
        title: "Vendetta Page",
        shouldRender: () => false,
        render: ({ render: PageView, noErrorBoundary, ...options }: { render: React.ComponentType; noErrorBoundary: boolean } & Record<string, object>) => {
            const navigation = NavigationNative.useNavigation();

            React.useEffect(() => {
                navigation.setOptions(without(options, "render", "noErrorBoundary"));
            }, []);

            return noErrorBoundary ? <PageView /> : <ErrorBoundary><PageView /></ErrorBoundary>
        }
    },
];

export const getRenderableScreens = (youKeys = false) => getScreens(youKeys).filter(s => s.shouldRender?.() ?? true);

export const getPanelsScreens = () => keyMap(getScreens(), (s) => ({
    title: s.title,
    render: p => <s.render {...p} />,
    ...s.options,
}));

export const getYouData = () => {
    const screens = getScreens(true);

    return {
        getLayout: () => ({
            label: "Vendetta",
            // We can't use our keyMap function here since `settings` is an array not an object
            settings: getRenderableScreens(true).map(s => s.key)
        }),
        titleConfig: keyMap(screens, "title"),
        relationships: keyMap(screens, null),
        rendererConfigs: keyMap(screens, (s) => {
            const WrappedComponent = React.memo(({ navigation, route }: any) => {
                navigation.addListener("focus", () => navigation.setOptions(s.options));
                return <RN.View style={styles.container}><s.render {...route.params} /></RN.View>
            });

            return {
                type: "route",
                icon: s.icon ? getAssetIDByName(s.icon) : null,
                title: () => s.title,
                screen: {
                    // TODO: This is bad, we should not re-convert the key casing
                    // For some context, just using the key here would make the route key be VENDETTA_CUSTOM_PAGE in you tab, which breaks compat with panels UI navigation
                    route: lodash.chain(s.key).camelCase().upperFirst().value(),
                    getComponent: () => WrappedComponent,
                }
            }
        }),
    };
};
