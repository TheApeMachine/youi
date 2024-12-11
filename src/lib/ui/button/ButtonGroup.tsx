import { jsx } from "@/lib/template";
import { Row } from "../flex/Flex";

interface ButtonGroupProps {
    children: JSX.Element[];
}

export const ButtonGroup = ({ children }: ButtonGroupProps) => {
    return <Row className="button-group">{children}</Row>;
};
