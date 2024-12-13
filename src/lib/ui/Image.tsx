import { jsx } from "@/lib/vdom";

interface ImageProps {
    src: string;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
}

export const Image = async ({
    src,
    alt,
    className,
    fallbackSrc
}: ImageProps) => {
    return (
        <div className={className}>
            <img
                alt={alt ?? "Fallback image"}
                class={`image`}
                src={src}
            />
        </div>
    );
};
