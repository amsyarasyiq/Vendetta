// @pylixonly: why plugins when you can just make it to the core
import { before, instead } from "spitroast";
import { findByProps, findByName, findByCache } from "@lib/metro/filters";
import { FluxDispatcher, ReactNative } from "@lib/metro/common";

const Tables = findByProps("TableRow");
const FormComponents = findByProps("Arrow", "Icon");
const FormSwitch = findByCache(({ props }) => props?.has("FormSwitch") && props?.size === 1)?.FormSwitch

const { TableRowIcon } = Tables;

export default () => {
    // It's force enabled on TabsV2
    findByProps("isNotificationRedesignV2Enabled").useIsNotificationRedesignV2Enabled = () => false;

    instead("Icon", FormComponents, ([props]) => <TableRowIcon {...props} />);

    instead("render", ReactNative.Switch, ([props]) => {
        return <FormSwitch {...props} />;
    });

    before("default", findByName("FormSection", false), ([props]) => {
        props.uppercaseTitle = false;
        props.textStyle = "heading-sm/semibold";
    });

    // die = () => dont();
    // instead("_dispatch", FluxDispatcher, (args, orig) => {
    //     try {
    //         return orig(...args);
    //     } catch (e) {
    //        return Promise.resolve();
    //     }
    // });
}