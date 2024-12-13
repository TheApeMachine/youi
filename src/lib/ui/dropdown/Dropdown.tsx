import { jsx } from "@/lib/vdom";
import { stateManager } from "@/lib/state";
import Button from "@/lib/ui/button/Button";
import { List, ListItem } from "@/lib/ui/list/List";
import { Background, Unit } from "@/lib/ui/types";

interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownState {
    isOpen: boolean;
}

interface DropdownProps {
    children: JSX.Element;
    options: DropdownOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    background?: Background;
    gap?: boolean | Unit;
    pad?: boolean | Unit;
    radius?: boolean | Unit;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
}

export const Dropdown = async ({
    children,
    options,
    onChange,
    placeholder = "Select...",
    background,
    gap,
    pad,
    radius,
    className = "",
    triggerClassName = "",
    contentClassName = ""
}: DropdownProps) => {
    const dropdownId = crypto.randomUUID();
    const stateKey = `dropdown-${dropdownId}`;

    // Initialize state
    await stateManager.set(stateKey, { isOpen: false });

    const classes = {
        dropdown: true,
        [`gap-${gap === true ? "md" : gap}`]: gap,
        [`pad-${pad === true ? "md" : pad}`]: pad,
        [`radius-${radius === true ? "md" : radius}`]: radius,
        [background as string]: background,
        [className]: className
    };

    const handleToggle = async () => {
        console.log("handleToggle");
        const currentState = await stateManager.get<DropdownState>(stateKey);
        await stateManager.update(stateKey, { isOpen: !currentState?.isOpen });
        const dropdownContent = document.querySelector(
            `[data-dropdown-id="${dropdownId}"]`
        );
        if (dropdownContent) {
            dropdownContent.classList.toggle("open", state.isOpen);
        }
    };

    const handleOptionClick = async (value: string) => {
        console.log("handleOptionClick", value);
        onChange(value);
        await stateManager.update(stateKey, { isOpen: false });
    };

    // Subscribe to state changes
    stateManager.subscribe(stateKey, (state: DropdownState) => {
        console.log("stateManager.subscribe", state);
        const dropdownContent = document.querySelector(
            `[data-dropdown-id="${dropdownId}"]`
        );
        if (dropdownContent) {
            dropdownContent.classList.toggle("open", state.isOpen);
        }
    });

    return (
        <div className={classes}>
            <Button
                variant="secondary"
                className={triggerClassName}
                onClick={handleToggle}
            >
                {children || placeholder}
                <List
                    className={`dropdown-content foldable ${contentClassName}`}
                    background={background || "bg"}
                    pad={pad}
                    radius={radius}
                    data-dropdown-id={dropdownId}
                >
                    {options.map(({ label, value }) => (
                        <ListItem onClick={() => handleOptionClick(value)} pad>
                            {label}
                        </ListItem>
                    ))}
                </List>
            </Button>
        </div>
    );
};
