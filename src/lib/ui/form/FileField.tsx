import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface FileFieldProps {
    label: string;
    name: string;
    accept?: string;
    required?: boolean;
}

export const FileField = Component({
    render: async ({
        label,
        name,
        accept = "image/*",
        required = false
    }: FileFieldProps) => {
        return (
            <div class="input-group">
                <input
                    type="file"
                    id={name}
                    name={name}
                    accept={accept}
                    required={required}
                />
                <label for={name}>{label}</label>
                <span class="material-icons">image</span>
            </div>
        );
    }
});
