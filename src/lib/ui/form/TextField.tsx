import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface TextFieldProps {
    label: string;
    name: string;
    type?: "text" | "email" | "password";
    value?: string;
    required?: boolean;
    icon?: string;
}

export const TextField = Component({
    render: async ({
        label,
        name,
        type = "text",
        value = "",
        required = false,
        icon
    }: TextFieldProps) => {
        return (
            <div class="input-group">
                <input
                    type={type}
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
