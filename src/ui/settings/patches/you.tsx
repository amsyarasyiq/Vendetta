import { findByProps } from "@metro/filters";
import { after, before } from "@lib/patcher";
import { getRenderableScreens, getScreens, getYouData } from "@ui/settings/data";
import { i18n } from "@/lib/metro/common";

const settingsListComponents = findByProps("SearchableSettingsList");
const miscModule = findByProps("SETTING_RELATIONSHIPS", "SETTING_RENDERER_CONFIGS");
const gettersModule = findByProps("getSettingListItems");

export default function patchYou() {
    if (!gettersModule) return () => void 0;

    const patches = new Array<Function>;
    const screens = getScreens(true);
    const data = getYouData();

    patches.push(before("type", settingsListComponents.SearchableSettingsList, ([{ sections }]) => {
        // Add our settings
        const accountSettingsIndex = sections.findIndex((i: any) => i.title === i18n.Messages.ACCOUNT_SETTINGS);
        sections.splice(accountSettingsIndex + 1, 0, data.getLayout());

        // Upload Logs button be gone
        const supportCategory = sections.find((i: any) => i.title === i18n.Messages.SUPPORT);
        supportCategory.settings = supportCategory.settings.filter((s: string) => s !== "UPLOAD_DEBUG_LOGS")
    }));

    patches.push(after("getSettingTitleConfig", miscModule, (_, ret) => ({
        ...ret,
        ...data.titleConfig,
    })));

    patches.push(after("getSettingListSearchResultItems", gettersModule, (_, ret) => {
        ret.forEach((s: any) => screens.some(b => b.key === s.setting) && (s.breadcrumbs = ["Vendetta"]))
    }));

    // TODO: We could use a proxy for these
    const oldRelationships = miscModule.SETTING_RELATIONSHIPS;
    miscModule.SETTING_RELATIONSHIPS = { ...oldRelationships, ...data.relationships };

    const oldRendererConfigs = miscModule.SETTING_RENDERER_CONFIGS;
    miscModule.SETTING_RENDERER_CONFIGS = { ...oldRendererConfigs, ...data.rendererConfigs };

    return () => {
        miscModule.SETTING_RELATIONSHIPS = oldRelationships;
        miscModule.SETTING_RENDERER_CONFIGS = oldRendererConfigs;
        patches.forEach(p => p());
    };
}