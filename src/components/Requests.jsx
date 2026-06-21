import { Icon } from "./icons";
import { Avatar } from "./ui";

export default function Requests({ requests, onPost, onOffer }) {
  return (
    <div className="requests-wrap">
      <div className="page-head">
        <div>
          <h1>Request board</h1>
          <p>Can't find it? Post what you need and let your hostel respond.</p>
        </div>
        <button className="btn-primary lg" onClick={onPost}>
          <Icon name="plus" size={17} sw={2.2} />
          Post a request
        </button>
      </div>

      <div className="req-list">
        {requests.map((r) => (
          <article className="req-card" key={r.id}>
            <Avatar name={r.who} av={r.av} size={44} verified={r.verified} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="req-meta">
                <span className="req-who">{r.who}</span>
                <span className="req-when">
                  {r.loc} · {r.time}
                </span>
                {r.urgent && <span className="urgent-pill">URGENT</span>}
              </div>
              <div className="req-item">Looking for: {r.item}</div>
              <div className="req-note">{r.note}</div>
              <div className="req-actions">
                <button className="btn-soft" onClick={() => onOffer(r.id)} disabled={r.offered}>
                  <Icon name="chat" size={15} sw={2} />
                  {r.offered ? "Offered" : "I have this"}
                </button>
                <span className="req-offers">{r.replies} offers</span>
              </div>
            </div>
            <div className="req-right">
              <div className="req-mode">{r.modeLabel}</div>
              <div className="req-budget">{r.budget}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
