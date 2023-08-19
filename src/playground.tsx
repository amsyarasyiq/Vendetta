// @pylixonly: why plugins when you can just make it to the core
import { before, instead } from "spitroast";
import { findByProps, findByName, findByCache } from "@lib/metro/filters";
import { ReactNative } from "@lib/preinit";

const Tables = findByProps("TableRow");
const FormComponents = findByProps("Arrow", "Icon");
const FormSwitch = findByCache(({ props }) => props?.has("FormSwitch") && props?.size === 1)?.FormSwitch

const { TableRowIcon } = Tables;

export default () => {
    // yeet the guhh
    findByProps("isNotificationRedesignV2Enabled").useIsNotificationRedesignV2Enabled = () => false;

    instead("Icon", FormComponents, ([props]) => <TableRowIcon {...props} />);

    instead("render", ReactNative.Switch, ([props]) => {
        return <FormSwitch {...props} />;
    });

    before("default", findByName("FormSection", false), ([props]) => {
        props.uppercaseTitle = false;
        props.textStyle = "heading-sm/semibold";
    });
}