import { jsx } from "@/lib/vdom";
import { DynamicIsland } from "@/lib/ui/DynamicIsland";
import "@/assets/logo.css";
import { Rainbow } from "@/lib/ui/logo/Rainbow";
import Button from "@/lib/ui/button/Button";
import { routerManager } from "@/lib/router/manager";

export const Home = async (): Promise<JSX.Element> => {
    console.log("Home component rendering");

    const islandId = crypto.randomUUID();

    return (
        <DynamicIsland
            id={islandId}
            variant="logo"
            main={<Rainbow />}
            footer={<Button icon="menu" onClick={
                () => routerManager.navigate(`/home/${islandId}/menu`)
            } />}
        />
    );
}

export default Home;
