import { jsx } from "@/lib/vdom";
import Icon from "@/lib/ui/icon/Icon";

interface Step {
    label: string;
    status: "completed" | "active" | "pending";
    description: string;
}

interface StepperProps {
    steps: Step[];
}

export default ({ steps }: StepperProps) => {
    return (
        <div className="stepper">
            {steps.map((step) => (
                <div className={`stepper__step stepper__step--${step.status}`}>
                    <div className="stepper__indicator">
                        {step.status === "completed" && (
                            <Icon icon="check-circle" color="success" />
                        )}
                        {step.status === "active" && (
                            <Icon icon="half-circle" color="warning" />
                        )}
                        {step.status === "pending" && (
                            <Icon icon="empty-circle" color="neutral" />
                        )}
                    </div>
                    <div className="stepper__content">
                        <div className="stepper__label">{step.label}</div>
                        <div className="stepper__description">
                            {step.description}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
