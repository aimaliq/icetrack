import type { ReactNode } from "react";
import { Plane, Car, Sailboat, Home, Gem } from "lucide-react";
import type { AssetCategory } from "./types";

/**
 * Category marks, from Lucide (ISC licensed).
 *
 * A drawn-by-hand set was tried and was not good enough; these are made by
 * people who do this properly and stay consistent with each other, which is
 * the part that is hard to fake. They inherit colour and are sized by the
 * caller through the wrapper's width and height.
 */
const props = { className: "h-full w-full", strokeWidth: 1.25, "aria-hidden": true };

export const CATEGORY_SILHOUETTE: Record<AssetCategory, ReactNode> = {
  jet: <Plane {...props} />,
  car: <Car {...props} />,
  yacht: <Sailboat {...props} />,
  estate: <Home {...props} />,
  accessories: <Gem {...props} />,
};
