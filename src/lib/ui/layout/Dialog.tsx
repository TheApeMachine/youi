import { jsx } from "@/lib/template";
import { Navigation } from "../menu/Navigation";
import { navigation } from "@/lib/ui/layout/navigation";

export const Dialog = ({ children }: { children: JSX.Element }) => {
    return (
        <Dialog>
            <Navigation items={navigation} />
        </Dialog>
    );
};