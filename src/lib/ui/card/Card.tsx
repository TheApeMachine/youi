import { jsx } from "@/lib/vdom";
import { Column } from "../flex/Flex";

export default async ({ children }: { children: JSX.Element }) => {
    return (
        <Column className="card">
            {children}
        </Column>
    );
};
