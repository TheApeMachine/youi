import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "../Flex";
import { Icon } from "../Icon";

export const Footer = Component({
    render: async () => (
        <footer>
            <Icon icon="arrow_drop_up" />
            <Flex fullWidth>
                YouI &copy; 2024{" "}
                <a href="https://theapemachine.com" target="_blank">
                    The Ape Machine
                </a>
            </Flex>
        </footer>
    )
});
