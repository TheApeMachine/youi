import { jsx } from "@/lib/template";
import { Component } from "../Component";

export const ErrorBoundary = Component({
    render: () => (
        <dialog id="error-boundary">
            <h1>Error</h1>
        </dialog>
    )
});
