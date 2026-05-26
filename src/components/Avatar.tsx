import type { AvatarColor } from "@/types";

interface AvatarProps {
  name: string;
  color?: AvatarColor;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, color = "slate", size }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return <div className={`avatar ${color}${size ? " " + size : ""}`}>{initials}</div>;
}
