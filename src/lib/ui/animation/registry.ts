import { logo } from "./animations/logo";

export const ANIMATIONS = {
    logo
} as const;

export type AnimationVariant = keyof typeof ANIMATIONS; 