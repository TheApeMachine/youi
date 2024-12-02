import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "../Flex";

interface TextFieldProps {
    label: string;
    name: string;
    type?: "text" | "email" | "password";
    value?: string;
    required?: boolean;
    icon?: string;
    validationMessage?: string;
}

export const TextField = Component({
    effect: () => {
        document.querySelectorAll(".input-group input").forEach((input) => {
            const group = input.closest(".input-group");
            if (!group) return;

            const inputElement = input as HTMLInputElement;
            const errorSpan = group.querySelector(".error-message");

            inputElement.addEventListener("focus", () => {
                group.classList.add("focused");
            });

            inputElement.addEventListener("blur", () => {
                group.classList.add("touched");
                if (!inputElement.value) {
                    group.classList.remove("focused");
                }
                group.classList.toggle("error", !inputElement.checkValidity());
            });

            inputElement.addEventListener("input", () => {
                if (group.classList.contains("touched")) {
                    group.classList.toggle(
                        "error",
                        !inputElement.checkValidity()
                    );
                }
            });
        });
    },
    render: async ({
        label,
        name,
        type = "text",
        value = "",
        required = false,
        icon,
        validationMessage
    }: TextFieldProps) => {
        return (
            <Flex direction="column" className="input-group" fullWidth>
                <label for={name}>{label}</label>
                <Flex>
                    {icon && (
                        <span class="material-symbols-rounded">{icon}</span>
                    )}
                    <input
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        required={required}
                        data-validation-message={validationMessage}
                    />
                </Flex>
                <span class="error-message">{validationMessage}</span>
            </Flex>
        );
    }
});
