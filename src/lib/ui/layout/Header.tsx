import { jsx } from "@/lib/vdom";
import { Dropdown } from "@/lib/ui/dropdown/Dropdown";
import { themeManager } from "@/lib/theme/manager";
import { eventBus } from "@/lib/event";

export const Header = () => {
    const handleThemeChange = (value: string) => {
        eventBus.publish("theme", "theme:change", value);
    };

    return (
        <header>
            <Dropdown
                options={[
                    { label: "Plastic Fantastic", value: "base" },
                    { label: "Neumorphism", value: "neumorphic" },
                    { label: "Glassmorphism", value: "glassmorphic" },
                    { label: "Soft UI", value: "softui" },
                    { label: "Neo-Brutalism", value: "neobrutalism" },
                    { label: "Cyberpunk", value: "cyberpunk" }
                ]}
                onChange={handleThemeChange}
            >
                Layout
            </Dropdown>
        </header>
    );
};
