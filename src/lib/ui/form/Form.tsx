import { jsx } from "@/lib/vdom";
import { stateManager } from "@/lib/state";
import { eventManager } from "@/lib/event";
import TextField from "./TextField";

export type Field = {
    type:
    | "email"
    | "password"
    | "text"
    | "number"
    | "date"
    | "checkbox"
    | "select"
    | "textarea"
    | "file";
    label: string;
    placeholder?: string;
    required: boolean;
    icon?: string;
    value?: any;
    error?: string;
};

export interface FormState {
    values: Record<string, any>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
}

const isFieldValid = (value: any, field: Field): boolean => {
    if (field.required && (!value || value.trim() === "")) {
        return false;
    }
    if (field.type === "email" && value && value.trim() !== "") {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return true;
};

const getFieldError = (value: any, field: Field): string | undefined => {
    if (field.required && (!value || value.trim() === "")) {
        return `${field.label} is required`;
    }
    if (field.type === "email" && value && value.trim() !== "") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Invalid email address";
        }
    }
    return undefined;
};

export default async ({
    onSubmit,
    fields,
    buttons,
    id = crypto.randomUUID()
}: {
    onSubmit: (values: Record<string, any>) => void | Promise<void>;
    fields: Record<string, Field>;
    buttons?: Record<string, JSX.Element>;
    id?: string;
}) => {
    const formState: FormState = {
        values: Object.fromEntries(
            Object.entries(fields).map(([name, field]) => [
                name,
                field.value ?? ""
            ])
        ),
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: true
    };

    const stateKey = `form:${id}`;
    await stateManager.set(stateKey, formState);

    // Cleanup function to remove form state
    const cleanup = async () => {
        try {
            await stateManager.remove(stateKey);
        } catch (error) {
            console.error("Error cleaning up form state:", error);
        }
    };

    const getFormState = async (): Promise<FormState> => {
        const state = await stateManager.get<FormState>(stateKey);
        return state ?? formState;
    };

    const updateFieldValidation = (name: string, error?: string) => {
        const form = document.getElementById(id);
        if (!form) return;

        const field = form.querySelector(`input[name="${name}"]`);
        const fieldContainer = field?.closest(".field");
        if (!fieldContainer) return;

        // Update error class
        field?.classList.toggle("error", !!error);

        // Update or remove error message
        let errorDiv = fieldContainer.querySelector(".error-message");
        if (error) {
            if (!errorDiv) {
                errorDiv = document.createElement("div");
                errorDiv.className = "error-message";
                fieldContainer.appendChild(errorDiv);
            }
            errorDiv.textContent = error;
        } else if (errorDiv) {
            errorDiv.remove();
        }
    };

    const handleFieldChange = async (name: string, value: string) => {
        const currentState = await getFormState();
        const field = fields[name];

        // Update values
        const newValues = { ...currentState.values, [name]: value };

        // Check if field is valid (for immediate feedback)
        const isValid = isFieldValid(value, field);

        // Update state
        const newState = {
            ...currentState,
            values: newValues,
            isValid: true // We'll recalc on blur/submit
        };

        await stateManager.update(stateKey, newState);

        // Publish event so that other parts of the app know a field changed
        await eventManager.publish('form', `form:${id}.fieldChange`, { name, value, isValid });

        // Clear any existing error message while typing
        updateFieldValidation(name, undefined);
    };

    const handleFieldBlur = async (name: string) => {
        const currentState = await getFormState();
        const field = fields[name];
        const value = currentState.values[name];

        // Validate field on blur
        const error = getFieldError(value, field);

        // Update touched state and errors
        const newState = {
            ...currentState,
            touched: { ...currentState.touched, [name]: true },
            errors: {
                ...currentState.errors,
                ...(error ? { [name]: error } : {})
            }
        };

        if (!error) {
            delete newState.errors[name];
        }

        newState.isValid = Object.keys(newState.errors).length === 0;

        await stateManager.update(stateKey, newState);
        updateFieldValidation(name, error);

        // Publish field blur event
        await eventManager.publish('form', `form:${id}.fieldBlur`, { name, value, error });
    };

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        const currentState = await getFormState();

        // Mark all fields as touched
        const newTouched = Object.keys(fields).reduce(
            (acc, name) => ({ ...acc, [name]: true }),
            {}
        );

        // Validate all fields
        const errors: Record<string, string> = {};
        Object.entries(fields).forEach(([name, field]) => {
            const error = getFieldError(currentState.values[name], field);
            if (error) {
                errors[name] = error;
            }
        });

        const isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            const newState = {
                ...currentState,
                touched: newTouched,
                errors,
                isValid: false
            };

            await stateManager.update(stateKey, newState);

            // Update validation UI for all fields
            Object.entries(errors).forEach(([name, error]) => {
                updateFieldValidation(name, error);
            });

            // Publish form submit attempt event with errors
            await eventManager.publish('form', `form:${id}.submit`, {
                values: currentState.values,
                errors,
                isValid: false
            });

            return;
        }

        try {
            const submittingState = {
                ...currentState,
                touched: newTouched,
                isSubmitting: true,
                isValid: true
            };

            await stateManager.update(stateKey, submittingState);
            await onSubmit(currentState.values);

            // Clean up form state after successful submission
            await cleanup();

            // Publish successful submit event
            await eventManager.publish('form', `form:${id}.submit`, {
                values: currentState.values,
                errors: {},
                isValid: true
            });
        } catch (error) {
            const errorState = {
                ...currentState,
                touched: newTouched,
                isSubmitting: false,
                isValid: false
            };

            await stateManager.update(stateKey, errorState);

            // Publish failed submit event
            await eventManager.publish('form', `form:${id}.submitError`, {
                values: currentState.values,
                error: String(error),
            });
        }
    };

    const currentState = await getFormState();

    return (
        <form onSubmit={handleSubmit} id={id} noValidate>
            {Object.entries(fields).map(([name, field]) => (
                <div key={name} className="form-field">
                    <TextField
                        type={field.type as "text" | "email" | "password"}
                        label={field.label}
                        placeholder={field.placeholder}
                        name={name}
                        value={currentState.values[name] || ""}
                        required={field.required}
                        onChange={(value) => handleFieldChange(name, value)}
                        onBlur={() => handleFieldBlur(name)}
                    />
                </div>
            ))}
            {buttons &&
                Object.entries(buttons).map(([name, button]) => button)}
        </form>
    );
};
