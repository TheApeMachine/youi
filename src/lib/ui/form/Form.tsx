import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface FormProps {
    children: any;
    className?: string;
}

export const Form = Component({
    render: async ({ children, className = "" }: FormProps) => {
        return (
            <form
                class={`column gap ${className}`}
                data-trigger="submit"
                data-event="form"
                data-effect="submit"
            >
                {children}
            </form>
        );
    }
});
