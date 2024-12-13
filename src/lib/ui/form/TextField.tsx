import { jsx } from "@/lib/vdom";
import { Column } from "@/lib/ui/flex/Flex";

export default async ({
    type = "text",
    label,
    name,
    value = "",
    error,
    required = false,
    onChange,
    onBlur,
    ...props
}: {
    type?: "text" | "email" | "password";
    label?: string;
    name: string;
    value?: string;
    error?: string;
    required?: boolean;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
}) => {
    const handleChange = (event: InputEvent) => {
        const target = event.target as HTMLInputElement;
        onChange?.(target.value);
    };

    const handleBlur = (event: FocusEvent) => {
        const target = event.target as HTMLInputElement;
        onBlur?.(target.value);
    };

    return (
        <Column className="field">
            <label for={name}>{label}</label>
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                required={required}
                className={error ? "error" : ""}
                onInput={handleChange}
                onBlur={handleBlur}
                {...props}
            />
            {error && <div className="error-message">{error}</div>}
        </Column>
    );
};
