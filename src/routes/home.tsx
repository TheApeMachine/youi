import { jsx } from "@/lib/template";
import { DynamicIsland } from "@/lib/ui/DynamicIsland";
import "@/assets/logo.css";
import { Rainbow } from "@/lib/ui/logo/Rainbow";

export default () => <DynamicIsland variant="logo" main={<Rainbow />} />;
