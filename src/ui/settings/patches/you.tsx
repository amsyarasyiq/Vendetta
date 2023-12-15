import { findByProps } from "@metro/filters";
import { after, before } from "@lib/patcher";
import { getScreens, getYouData } from "@ui/settings/data";
import { i18n } from "@lib/metro/common";

const settingsListComponents = findByProps("SearchableSettingsList");
const settingConstantsModule = findByProps("SETTING_RENDERER_CONFIG");
const gettersModule = findByProps("getSettingListItems");

const isLabel = (i: any, name: string) => i?.label === name || i?.title === name;

function manipulateSections(sections: any[], layout: any) {
    if (!Array.isArray(sections) || sections.find((i: any) => isLabel(i, "Vendetta"))) return;

    // Add our settings
    const accountSettingsIndex = sections.findIndex((i: any) => isLabel(i, i18n.Messages.ACCOUNT_SETTINGS));
    sections.splice(accountSettingsIndex + 1, 0, layout);

    // Upload Logs button be gone
    const supportCategory = sections.find((i: any) => isLabel(i, i18n.Messages.SUPPORT));
    if (supportCategory) supportCategory.settings = supportCategory.settings.filter((s: string) => s !== "UPLOAD_DEBUG_LOGS")
}

export default function patchYou() {
    if (!gettersModule) return () => void 0;

    const patches = new Array<Function>;
    const screens = getScreens(true);
    const data = getYouData();

    patches.push(before("type", settingsListComponents.SearchableSettingsList, ([{ sections }]) => manipulateSections(sections, data.getLayout())));

    patches.push(after("getSettingListSearchResultItems", gettersModule, (_, ret) => {
        ret.forEach((s: any) => screens.some(b => b.key === s.setting) && (s.breadcrumbs = ["Vendetta"]))
    }));

    const oldRendererConfig = settingConstantsModule.SETTING_RENDERER_CONFIG;
    settingConstantsModule.SETTING_RENDERER_CONFIG = { ...oldRendererConfig, ...data.rendererConfigs };

    return () => {
        settingConstantsModule.SETTING_RENDERER_CONFIGS = oldRendererConfig;
        patches.forEach(p => p());
    };
}