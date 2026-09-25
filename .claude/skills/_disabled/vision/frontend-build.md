# Skill: Frontend Build

> Small, surgical component/UI changes inside an already-established frontend.

## Scope check — this skill is for *changes*, not *builds*

Vision's lane: fixing, tweaking, wiring, and adding **one** component to a
system that already exists. If the task is to build a page, a section, a
design system, or a UI pattern the project doesn't have yet — **stop and hand
it back to NickFury for Odin.** That's not a judgement call to stretch; a
half-built page from the wrong agent is worse than a clean handoff.

## Match the design language — never regress it

Before changing anything visual, look at the components already in the
project. Your change must not land plainer, more static, or more
"default-framework" than what's around it. When you need a new component,
pull it per `skills/_global/modern-frontend.md#Component catalog` (anything
animated → `#Animated sections`) and check it against `#No Old UI` — then
retheme it to the brandpack tokens before committing.

## Component Template

```tsx
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Button({
  variant = "primary", size = "md", children, onClick, disabled, ariaLabel
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded font-medium transition-colors",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
        size === "sm" && "px-3 py-1 text-sm",
        size === "md" && "px-4 py-2"
      )}
      onClick={onClick} disabled={disabled} aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
```

## Performance Rules
- Lazy load routes
- Images: WebP, responsive srcset
- Font: `font-display: swap`
- Bundle: dynamic imports for heavy deps
- Targets: LCP < 2.5s, CLS < 0.1, FID < 100ms
