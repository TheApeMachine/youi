import { jsx } from "@/lib/template";
import { createEventProps } from "@/lib/event/dom";

export default async ({
    type = "text",
    name,
    value = "",
    error,
    required = false,
    onChange,
    onBlur,
    ...props
}: {
    type?: "text" | "email" | "password";
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
        <div className="field">
            <input
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
        </div>
    );
};
