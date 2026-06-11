import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import {
  PAGE_CONTAINER_CLASS,
  PAGE_CONTAINER_NARROW_CLASS,
  PAGE_FRAME_INNER_CLASS,
} from "@/constants/layout";
import { cn } from "@/lib/utils";

type PageWidthProps<T extends ElementType = "div"> = {
  as?: T;
  /** Use a narrower max width (e.g. profile settings) */
  narrow?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children" | "narrow">;

/**
 * Centers page content with consistent horizontal padding and max width.
 * Prefer this over duplicating `page-container` / `max-w-5xl` classes.
 */
export function PageWidth<T extends ElementType = "div">({
  as,
  narrow,
  className,
  children,
  ...props
}: PageWidthProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(narrow ? PAGE_CONTAINER_NARROW_CLASS : PAGE_CONTAINER_CLASS, className)}
      {...props}
    >
      {children}
    </Component>
  );
}

type PageWidthFrameProps = {
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

/**
 * Full-width shell for heroes/banners: edge-to-edge on mobile,
 * constrained to the same max width as `PageWidth` on md+.
 */
export function PageWidthFrame({
  className,
  innerClassName,
  children,
}: PageWidthFrameProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className={cn(PAGE_FRAME_INNER_CLASS, innerClassName)}>{children}</div>
    </div>
  );
}
