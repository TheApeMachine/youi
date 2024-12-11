export type Unit = "unit" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | undefined;

export type Radius = Unit | "bottom-xs" | "top-xs";

export type Alignment = "start" | "end" | "center" | "stretch"

export type Justification = Alignment | "between" | "around" | "evenly"

export type Color = "transparent" | "highlight" | "fg" | "bg" | "muted" | "brand" | "brand-light" | "brand-dark" | "danger" | "danger-light" | "danger-dark" | "success" | "warning" | "info";

export type Background = "transparent" | "surface" | "glass" | "glass-tint" | "gradient" | "gradient-vertical" | "surface" | "surface-tint" | "surface-gradient" | "surface-gradient-vertical" | "muted" | "brand" | "brand-light" | "brand-dark" | "danger" | "danger-light" | "danger-dark" | "success" | "warning" | "info" | Color;

export type TextAlignment = "left" | "center" | "right";
