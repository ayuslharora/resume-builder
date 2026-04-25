import { lazy } from "react";

export const templates = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean and distraction-free",
    thumbnail: "/templates/minimal.png",
    component: lazy(() => import("./Minimal"))
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Bold typography with accents",
    thumbnail: "/templates/modern.png",
    component: lazy(() => import("./Modern"))
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "Classic corporate structure",
    thumbnail: "/templates/professional.png",
    component: lazy(() => import("./Professional"))
  },
  creative: {
    id: "creative",
    name: "Creative",
    description: "Vibrant and asymmetrical",
    thumbnail: "/templates/creative.png",
    component: lazy(() => import("./Creative"))
  }
};

export const templateList = Object.values(templates);
