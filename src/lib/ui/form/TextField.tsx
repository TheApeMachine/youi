import { jsx } from "@/lib/template";

export default async ({
    type = "text",
    name,
    value = "",
    error,
    required = false,
    onChange,
    ...props
}: {
    type?: "text" | "email" | "password";
    name: string;
    value?: string;
    error?: string;
    required?: boolean;
    onChange?: (value: string) => void;
}) => {
    const handleChange = (event: InputEvent) => {
        const target = event.target as HTMLInputElement;
        onChange?.(target.value);
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
                {...props}
            />
            {error && <div className="error-message">{error}</div>}
        </div>
    );
};
