export type Unit = "unit" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | undefined;

export type Radius = Unit | "bottom-xs" | "top-xs";

export type Alignment = "start" | "end" | "center" | "stretch"

export type Justification = Alignment | "space-between" | "space-around" | "space-evenly"

export type Color = "transparent" | "highlight" | "fg" | "bg" | "muted" | "brand" | "brand-light" | "brand-dark" | "danger" | "danger-light" | "danger-dark" | "success" | "warning" | "info";

export type Background = "transparent" | "surface" | "bg-glass" | "bg-glass-tint" | "bg-gradient" | "bg-gradient-vertical" | "bg-surface" | "bg-surface-tint" | "bg-surface-gradient" | "bg-surface-gradient-vertical" | "bg-muted" | "bg-brand" | "bg-brand-light" | "bg-brand-dark" | "bg-danger" | "bg-danger-light" | "bg-danger-dark" | "bg-success" | "bg-warning" | "bg-info" | Color;

export type TextAlignment = "left" | "center" | "right";