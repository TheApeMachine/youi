import { jsx } from "@/lib/vdom";
import { DynamicIsland } from "@/lib/ui/dynamic-island/DynamicIsland";
import "@/assets/logo.css";
import { Rainbow } from "@/lib/ui/logo/Rainbow";
import Button from "@/lib/ui/button/Button";
import { routerManager } from "@/lib/router/manager";
import { Center } from "@/lib/ui/flex/Flex";

export const Home = async (): Promise<JSX.Element> => {
    const islandId = crypto.randomUUID();

    return (
        <Center grow>
            <DynamicIsland id={islandId} variant="logo">
                <Rainbow />
                <Button
                    icon="menu"
                    onClick={() =>
                        routerManager.navigate(`/home/${islandId}/menu`)
                    }
                />
            </DynamicIsland>
        </Center>
    );
};

export default Home;
