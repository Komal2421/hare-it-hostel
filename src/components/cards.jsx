import { Icon } from "./icons";
import { Avatar } from "./ui";
import { priceLabel, kindLabel, kindTag } from "../format";

function Rating({ s }) {
  return (
    <span className="rating" style={{ color: "var(--amber)" }}>
      <Icon name="star" size={12} />
      <span style={{ color: "var(--t2)" }}>{s.rating != null ? s.rating.toFixed(1) : "New"}</span>
      {s.reviews != null && s.showReviews && (
        <span style={{ color: "var(--t4)", fontWeight: 500 }}> ({s.reviews})</span>
      )}
    </span>
  );
}

function Pin({ children }) {
  return (
    <div className="card-loc">
      <span style={{ color: "var(--t5)", display: "flex" }}>
        <Icon name="pin" size={13} sw={1.9} />
      </span>
      <span>{children}</span>
    </div>
  );
}

export function ListingCard({ item, onOpen, onWish }) {
  return (
    <article className="card" onClick={() => onOpen(item.id)}>
      <div className="card-media" style={{ background: item.tint }}>
        {item.image ? <img src={item.image} alt={item.title} /> : <span className="tint-label">{item.label}</span>}
        <span className="kind-tag" style={kindTag(item.cat)}>
          {kindLabel(item.cat)}
        </span>
        <button
          className="heart-btn"
          style={{ color: item.wished ? "var(--accent)" : "var(--t2)" }}
          onClick={(e) => {
            e.stopPropagation();
            onWish(item.id);
          }}
          title="Wishlist"
        >
          <Icon name="heart" size={18} fill={item.wished ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="card-body">
        <h3>{item.title}</h3>
        <div className="card-price">
          {priceLabel(item)}
          {item.unit && <span className="unit">{item.unit}</span>}
        </div>
        <Pin>{item.loc}</Pin>
        <div className="seller-row">
          <Avatar name={item.seller.name} av={item.seller.av} size={26} verified={item.seller.verified} />
          <span className="seller-name">{item.seller.name}</span>
          <Rating s={item.seller} />
        </div>
      </div>
    </article>
  );
}

export function ListingRow({ item, onOpen, onWish }) {
  return (
    <article className="list-row" onClick={() => onOpen(item.id)}>
      <div className="list-thumb" style={{ background: item.tint }}>
        {item.image ? <img src={item.image} alt={item.title} /> : <span className="tint-label" style={{ fontSize: 10 }}>{item.label}</span>}
        <span className="kind-tag" style={{ ...kindTag(item.cat), top: 8, left: 8, padding: "3px 8px", fontSize: 10.5 }}>
          {kindLabel(item.cat)}
        </span>
      </div>
      <div className="list-info">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h3>{item.title}</h3>
            <div className="list-sub">
              {item.sub} · {item.cond}
            </div>
          </div>
          <button
            className="heart-btn-sm"
            style={{ color: item.wished ? "var(--accent)" : "var(--t2)" }}
            onClick={(e) => {
              e.stopPropagation();
              onWish(item.id);
            }}
            title="Wishlist"
          >
            <Icon name="heart" size={18} fill={item.wished ? "currentColor" : "none"} />
          </button>
        </div>
        <Pin>{item.loc} · {item.dist}</Pin>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={item.seller.name} av={item.seller.av} size={26} verified={item.seller.verified} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.seller.name}</span>
            <Rating s={{ ...item.seller, showReviews: true }} />
          </div>
          <div className="list-price">
            {priceLabel(item)}
            {item.unit && <span className="unit">{item.unit}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function NearbyCard({ item, onOpen, showDist = true }) {
  return (
    <div className="nearby-card" onClick={() => onOpen(item.id)}>
      <div className="nearby-img" style={{ background: item.tint }}>
        {item.image ? <img src={item.image} alt={item.title} /> : <span className="tint-label">{item.label}</span>}
        {showDist && item.dist && <span className="dist-pill">{item.dist}</span>}
      </div>
      <div className="ttl">{item.title}</div>
      <div className="price">
        {priceLabel(item)}
        {item.unit && <span className="unit">{item.unit}</span>}
      </div>
    </div>
  );
}
