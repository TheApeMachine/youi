import { jsx } from "@/lib/template";
import { Flex } from "../Flex";

export default async ({ children }: { children: JSX.Element }) => {
    return (
        <Flex className="card" gap>
            {children}
        </Flex>
    );
};
