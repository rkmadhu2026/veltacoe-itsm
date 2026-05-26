import { userById } from "@/data/users";
import { Avatar } from "./Avatar";

interface UserByIdProps {
  id: string | null | undefined;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
}

export function UserById({ id, showName = true, size = "sm" }: UserByIdProps) {
  const u = userById(id);
  if (!u) {
    return (
      <span className="text-mute" style={{ fontStyle: "italic" }}>
        Unassigned
      </span>
    );
  }
  return (
    <div className="row row-8">
      <Avatar name={u.name} color={u.color} size={size} />
      {showName && (
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 550,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {u.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{u.team}</div>
        </div>
      )}
    </div>
  );
}
