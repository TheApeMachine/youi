import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface ImageProps {
    src: string;
    alt?: string;
    className?: string;
}

export const Image = Component({
    render: ({ src, alt, className }: ImageProps) => (
        <div class="image-badge">
            <img alt={alt} class={className} src={src} />
            <div class="status online" />
        </div>
    )
});
