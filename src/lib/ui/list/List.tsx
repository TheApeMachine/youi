import { jsx } from "@/lib/template";
import { Alignment, Background, Justification, Unit } from "@/lib/ui/types";

interface ListProps {
    children: JSX.Element;
    id?: string;
    zebra?: boolean;
    background?: Background;
    gap?: boolean | Unit;
    pad?: boolean | Unit;
    radius?: boolean | Unit;
    align?: Alignment;
    justify?: Justification;
    className?: string;
    'data-dropdown-id'?: string;
}

interface ListItemProps {
    children: JSX.Element;
    background?: Background;
    pad?: boolean | Unit;
    radius?: boolean | Unit;
    className?: string;
    onClick?: () => void;
}

export const List = async ({
    children,
    id,
    zebra,
    background,
    gap,
    pad,
    radius,
    align,
    justify,
    className = "",
    'data-dropdown-id': dropdownId
}: ListProps) => {
    const classes = {
        list: true,
        zebra: zebra,
        [`gap-${gap === true ? 'md' : gap}`]: gap,
        [`pad-${pad === true ? 'md' : pad}`]: pad,
        [`radius-${radius === true ? 'md' : radius}`]: radius,
        [`align-${align}`]: align,
        [`justify-${justify}`]: justify,
        [background as string]: background,
        [className]: className
    };

    return <ul id={id} className={classes} data-dropdown-id={dropdownId}>{children}</ul>;
};

export const ListItem = async ({
    children,
    background,
    pad,
    radius,
    className = "",
    onClick
}: ListItemProps) => {
    const classes = {
        'list-item': true,
        [`pad-${pad === true ? 'md' : pad}`]: pad,
        [`radius-${radius === true ? 'md' : radius}`]: radius,
        [background as string]: background,
        [className]: className
    };

    return <li className={classes} onClick={onClick}>{children}</li>;
};
