import type { AvatarColor } from "@/types";

// Returns a CSS gradient for tenant/user color tokens. Replaces the legacy
// `colorFor` global in shell.jsx.
const GRADIENTS: Record<AvatarColor, string> = {
  amber: "linear-gradient(135deg,#f59e0b,#ef4444)",
  teal: "linear-gradient(135deg,#14b8a6,#0891b2)",
  pink: "linear-gradient(135deg,#ec4899,#8b5cf6)",
  purple: "linear-gradient(135deg,#8b5cf6,#6366f1)",
  slate: "linear-gradient(135deg,#64748b,#475569)",
  green: "linear-gradient(135deg,#10b981,#059669)",
};

const FALLBACK = "linear-gradient(135deg,#2563eb,#8b5cf6)";

export const colorFor = (name?: AvatarColor | string): string =>
  (name && (GRADIENTS as Record<string, string>)[name]) || FALLBACK;
