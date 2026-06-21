import { Icon } from "./icons";

export default function LostFound({ items, onReport, onRespond, responded }) {
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Lost &amp; Found</h1>
          <p>Reunite with your stuff. Report what you lost or post what you found.</p>
        </div>
        <button className="btn-primary lg" onClick={onReport}>
          <Icon name="plus" size={17} sw={2.2} />
          Report an item
        </button>
      </div>

      <div className="lf-grid">
        {items.map((l) => {
          const lost = l.type === "lost";
          const done = responded.has(l.id);
          return (
            <article className="lf-card" key={l.id}>
              <div className="lf-media" style={{ background: l.tint }}>
                {l.image ? <img src={l.image} alt={l.title} /> : <span className="tint-label">{l.label}</span>}
                <span
                  className="lf-status"
                  style={
                    lost
                      ? { background: "#FCECEC", color: "var(--red-deep)" }
                      : { background: "#EAF6EF", color: "var(--green)" }
                  }
                >
                  {lost ? "LOST" : "FOUND"}
                </span>
              </div>
              <div className="lf-body">
                <h3>{l.title}</h3>
                <div className="lf-where">
                  <span style={{ color: "var(--t5)", display: "flex" }}>
                    <Icon name="pin" size={13} sw={1.9} />
                  </span>
                  {l.where} · {l.time}
                </div>
                <button className="btn-outline" onClick={() => onRespond(l.id)} disabled={done}>
                  {done ? "Sent ✓" : lost ? "I've seen this" : "This is mine"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
