import { Icon } from "./icons";
import { initials } from "../format";

export function Avatar({ name, av, size = 34, verified = false, ring = false }) {
  const badge = Math.max(13, Math.round(size * 0.38));
  return (
    <div className="av-wrap">
      <div
        className="av"
        style={{
          width: size,
          height: size,
          background: av,
          fontSize: Math.round(size * 0.36),
          ...(ring ? { border: "2px solid var(--accent)" } : {}),
        }}
      >
        {initials(name)}
      </div>
      {verified && (
        <div className="verified" style={{ width: badge, height: badge }}>
          <Icon name="check" size={Math.round(badge * 0.6)} sw={4} className="" />
        </div>
      )}
    </div>
  );
}

export function Stars({ value, reviews }) {
  return (
    <span className="rating" style={{ color: "var(--amber)" }}>
      <Icon name="star" size={12} />
      <span style={{ color: "var(--t2)" }}>
        {value != null ? value.toFixed(1) : "New"}
        {reviews != null && <span style={{ color: "var(--t4)", fontWeight: 500 }}> ({reviews})</span>}
      </span>
    </span>
  );
}
