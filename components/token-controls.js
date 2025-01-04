import DynamicIsland from "./dynamic-island.js";
import Slider from "./ui/slider.js";
import Button from "./ui/button.js";
import Accordion from "./ui/accordion.js";
import { defaultTokenGroups } from "./token-groups.js";

export const TokenControls = () => {
    const classes = ["token-controls"];
    const STORAGE_KEY = 'youi-custom-tokens';

    return Object.entries(defaultTokenGroups).map(([group, tokens]) =>
        DynamicIsland(Accordion({
            label: group,
            content: Object.entries(tokens).map(([token, value]) =>
                DynamicIsland(Button(token, () => {
                    console.log(token);
                })).init()
            )
        })).init()
    );
};

export default TokenControls; 