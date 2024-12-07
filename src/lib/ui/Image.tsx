import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface ImageProps {
    src: string;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
}

const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

export const Image = Component({
    effect: ({
        rootElement,
        ...props
    }: { rootElement: HTMLElement } & ImageProps) => {
        const imgElement = rootElement.querySelector("img") as HTMLElement;
        const loadingDiv = rootElement.querySelector(
            ".image-loading"
        ) as HTMLElement;
        const fallbackImg = rootElement.querySelector(
            ".fallback"
        ) as HTMLElement;
        const initialsDiv = rootElement.querySelector(
            ".initials"
        ) as HTMLElement;

        if (!imgElement) return;

        const img = new window.Image();

        img.onload = () => {
            if (loadingDiv) loadingDiv.remove();
            imgElement.style.display = "block";
            if (fallbackImg) fallbackImg.style.display = "none";
            if (initialsDiv) initialsDiv.style.display = "none";
        };

        img.onerror = () => {
            if (loadingDiv) loadingDiv.remove();
            imgElement.style.display = "none";

            if (initialsDiv) {
                initialsDiv.style.display = "flex";
                if (fallbackImg) fallbackImg.style.display = "none";
            } else if (fallbackImg) {
                fallbackImg.style.display = "block";
            }
        };

        img.src = props.src;
    },

    render: ({ src, alt, className, fallbackSrc }: ImageProps) => (
        <div class="image-badge">
            <div class="image-loading">Loading...</div>
            <img alt={alt} class={className} src={src} style="display: none;" />
            <div
                class={`${className ?? ""} initials`}
                style="display: none; align-items: center; justify-content: center; background: #e2e8f0; color: #475569; font-weight: bold;"
            >
                {alt ? getInitials(alt) : "??"}
            </div>
            {fallbackSrc && (
                <img
                    alt={alt ?? "Fallback image"}
                    class={`${className ?? ""} fallback`}
                    src={fallbackSrc}
                    style="display: none;"
                />
            )}
            <div class="status online" />
        </div>
    )
});
