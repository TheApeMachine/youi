import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface CheckboxProps {
    label: string;
    name: string;
    value?: string;
    required?: boolean;
    icon?: string;
}

export const Checkbox = Component({
    render: async ({
        label,
        name,
        value = "",
        required = false,
        icon
    }: CheckboxProps) => {
        return (
            <div class="input-group">
                <input
                    type="checkbox"
                    id={name}
                    name={name}
                    value={value}
                    required={required}
                />
                <label for={name}>{label}</label>
                {icon && <span class="material-icons">{icon}</span>}
            </div>
        );
    }
});
