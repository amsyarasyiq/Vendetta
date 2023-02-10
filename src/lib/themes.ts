export function getThemeColorMap(): Record<string, [string, string?, string?]> {
    return getTheme().theme_color_map;
}

export function getThemeColors() {
    return getTheme().colours ?? getTheme().colors;
}

export function getUnsafeColors() {
    return getTheme().unsafe_colors;
}

// currently a hardcoded modified Enmity theme :troll:
export function getTheme(): any {
    const b = {
        "name": "Eris",
        "version": "1.0",
        "color": "#14161A",
        "description": "Black, classic Discord theme... now on Enmity",
        "authors": [
            {
                "name": "Yan.",
                "id": "735538297815957584"
            }
        ],
        "theme_color_map": {
            "BACKGROUND_PRIMARY": ["#1F2125"],
            "BACKGROUND_SECONDARY": ["#14161A"],
            "BACKGROUND_SECONDARY_ALT": ["#14161A"],
            "BACKGROUND_TERTIARY": ["#14161A"],
            "BACKGROUND_ACCENT": ["#1F2125"],
            "BACKGROUND_FLOATING": ["#14161A"],
            "BACKGROUND_NESTED_FLOATING": ["#14161A"],
            "BACKGROUND_MOBILE_PRIMARY": ["#1F2125"],
            "BACKGROUND_MOBILE_SECONDARY": ["#1F2125"],
            "BACKGROUND_MODIFIER_ACTIVE": ["#1F2125"],
            "BACKGROUND_MODIFIER_SELECTED": ["#14161A"],
            "CHANNELS_DEFAULT": ["#c2c2c2"],
            "HEADER_PRIMARY": ["#ffffff"],
            "HEADER_SECONDARY": ["#c2c2c2"],
            "INTERACTIVE_ACTIVE": ["#ffffff"],
            "INTERACTIVE_NORMAL": ["#d0d1d4"],
            "TEXT_MUTED": ["#c2c2c2"]
        } as Record<string, [string, string?, string?]>,
        "colours": {
            "PRIMARY_DARK": "#1F2125",
            "PRIMARY_DARK_100": "#C2C2C2",
            "PRIMARY_DARK_300": "#c2c2c2",
            "PRIMARY_DARK_360": "#FFFFFF",
            "PRIMARY_DARK_400": "#282C37",
            "PRIMARY_DARK_500": "#1F2125",
            "PRIMARY_DARK_600": "#1F2125",
            "PRIMARY_DARK_630": "#1F2125",
            "PRIMARY_DARK_700": "#14161A",
            "PRIMARY_DARK_800": "#14161A",
            "BRAND_NEW": "#7288DA",
            "WHITE": "#FFFFFF"
        } as Record<string, string>,
        "unsafe_colors": {
            "CHAT_GREY": "#1F2125"
        } as Record<string, string>
    }

    // Enmity compat
    b.theme_color_map.CHAT_BACKGROUND ??= b.theme_color_map.BACKGROUND_PRIMARY;
    return b;
}