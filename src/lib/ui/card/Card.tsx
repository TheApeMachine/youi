import { jsx } from "@/lib/template";
import { Column } from "../flex/Flex";

export default async ({ children }: { children: JSX.Element }) => {
    return (
        <Column className="card" pad="md" gap="md">
            {children}
        </Column>
    );
};
