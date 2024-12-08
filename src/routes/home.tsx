import { jsx } from "@/lib/template";
import { DynamicIsland } from "@/lib/ui/DynamicIsland";
import "@/assets/logo.css";
import { Rainbow } from "@/lib/ui/logo/Rainbow";
import { eventManager } from "@/lib/event";

console.log("Home route module loaded");

// Expose event manager for debugging
(window as any).debugEventManager = eventManager;

export default () => {
    console.log("Home component rendering");
    return <DynamicIsland variant="logo" main={<Rainbow />} />;
};
