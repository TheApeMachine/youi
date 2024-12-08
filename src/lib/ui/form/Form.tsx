import { jsx } from "@/lib/template";
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
    required: boolean;
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

const validateField = (
    name: string,
    value: any,
    field: Field
): string | undefined => {
    console.log(`[Form] Validating field ${name}:`, { value, field });

    if (field.required && (!value || value.trim() === "")) {
        console.log(`[Form] Field ${name} failed required validation`);
        return `${field.label} is required`;
    }
    if (
        field.type === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
        console.log(`[Form] Field ${name} failed email validation`);
        return "Invalid email address";
    }

    console.log(`[Form] Field ${name} passed validation`);
    return undefined;
};

const validateForm = (
    values: Record<string, any>,
    fields: Record<string, Field>
): Record<string, string> => {
    console.log(`[Form] Validating form:`, { values, fields });

    const errors: Record<string, string> = {};
    Object.entries(fields).forEach(([name, field]) => {
        const error = validateField(name, values[name], field);
        if (error) {
            errors[name] = error;
        }
    });

    console.log(`[Form] Form validation result:`, { errors });
    return errors;
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
    console.log(`[Form] Initializing form ${id}:`, { fields, buttons });

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

    // Set initial state and subscribe to changes
    const stateKey = `form:${id}`;
    console.log(`[Form] Setting initial state:`, formState);
    await stateManager.set(stateKey, formState);

    const getFormState = async (): Promise<FormState> => {
        const state = await stateManager.get<FormState>(stateKey);
        if (!state) {
            console.error(`[Form] No state found for form ${id}`);
            return formState;
        }
        return state;
    };

    const publishEvent = (eventType: string, eventData: any) => {
        console.log(`[Form] Publishing event:`, { eventType, eventData });
        eventManager.publish("events", `form.${eventType}`, {
            type: `form.${eventType}`,
            data: eventData
        });
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
        console.log(`[Form] Field change: ${name}`, { value });

        const currentState = await getFormState();
        console.log(`[Form] Current state before field change:`, currentState);

        const newValues = { ...currentState.values, [name]: value };
        const error = validateField(name, value, fields[name]);
        const newErrors = { ...currentState.errors };

        if (error) {
            newErrors[name] = error;
        } else {
            delete newErrors[name];
        }

        const newState = {
            values: newValues,
            errors: newErrors,
            touched: { ...currentState.touched, [name]: true },
            isSubmitting: currentState.isSubmitting,
            isValid: Object.keys(newErrors).length === 0
        };

        console.log(`[Form] New state after field change:`, newState);
        await stateManager.update(stateKey, newState);

        // Update field validation state in DOM
        updateFieldValidation(name, error);

        publishEvent("field.change", {
            field: name,
            value,
            error,
            state: newState
        });
    };

    const handleSubmit = async (event: SubmitEvent) => {
        console.log(`[Form] Form submission started`);
        event.preventDefault();

        const currentState = await getFormState();
        console.log(`[Form] Current state before submission:`, currentState);

        // Mark all fields as touched on submit attempt
        const touchedState = {
            ...currentState,
            touched: Object.keys(fields).reduce(
                (acc, name) => ({ ...acc, [name]: true }),
                {}
            )
        };
        await stateManager.update(stateKey, touchedState);

        const errors = validateForm(currentState.values, fields);
        const isValid = Object.keys(errors).length === 0;

        console.log(`[Form] Submission validation:`, { isValid, errors });

        if (!isValid) {
            const newState = { ...touchedState, errors, isValid: false };
            console.log(`[Form] Form invalid, updating state:`, newState);

            await stateManager.update(stateKey, newState);

            // Update all field validation states in DOM
            Object.entries(errors).forEach(([name, error]) => {
                updateFieldValidation(name, error);
            });

            publishEvent("validation", {
                errors,
                state: newState
            });
            return;
        }

        try {
            const submittingState = {
                ...touchedState,
                isSubmitting: true,
                isValid: true
            };
            console.log(
                `[Form] Starting submission, updating state:`,
                submittingState
            );

            await stateManager.update(stateKey, submittingState);

            publishEvent("submit.start", {
                values: currentState.values,
                state: submittingState
            });

            console.log(`[Form] Calling onSubmit handler`);
            await onSubmit(currentState.values);

            const completedState = { ...submittingState, isSubmitting: false };
            console.log(
                `[Form] Submission complete, updating state:`,
                completedState
            );

            await stateManager.update(stateKey, completedState);

            publishEvent("submit.success", {
                values: currentState.values,
                state: completedState
            });
        } catch (error) {
            console.error(`[Form] Submission error:`, error);

            const errorState = {
                ...touchedState,
                isSubmitting: false,
                isValid: false
            };
            console.log(`[Form] Updating state after error:`, errorState);

            await stateManager.update(stateKey, errorState);

            publishEvent("submit.error", {
                error,
                state: errorState
            });
        }
    };

    const renderForm = async () => {
        const currentState = await getFormState();

        return (
            <form onSubmit={handleSubmit} id={id} noValidate>
                {Object.entries(fields).map(([name, field]) => (
                    <div key={name} className="form-field">
                        <label>{field.label}</label>
                        <TextField
                            type={field.type as "text" | "email" | "password"}
                            name={name}
                            value={currentState.values[name] || ""}
                            required={field.required}
                            onChange={(value) => handleFieldChange(name, value)}
                        />
                    </div>
                ))}
                {buttons &&
                    Object.entries(buttons).map(([name, button]) => button)}
            </form>
        );
    };

    return renderForm();
};
