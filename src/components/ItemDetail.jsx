import { Icon } from "./icons";
import { Avatar } from "./ui";
import { NearbyCard } from "./cards";
import { priceLabel, kindLabel, kindTag, ctaLabel } from "../format";

export default function ItemDetail({ item, nearby, isOwner, onBack, onOpen, onWish, onRequest, onMessage, onEdit, onDelete }) {
  if (!item) return null;
  const thumbBorders = ["var(--accent)", "var(--border)", "var(--border)", "var(--border)", "var(--border)"];

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <Icon name="chevronLeft" size={17} sw={2} />
        Back to listings
      </button>

      <div className="detail">
        <div className="detail-left">
          <div className="hero" style={{ background: item.tint }}>
            {item.image ? (
              <img src={item.image} alt={item.title} />
            ) : (
              <span className="tint-label">{item.label} · PHOTO 1 / 5</span>
            )}
            <span className="kind-tag" style={{ ...kindTag(item.cat), top: 14, left: 14, padding: "5px 12px", fontSize: 12 }}>
              {kindLabel(item.cat)}
            </span>
          </div>
          <div className="thumbs">
            {[1, 2, 3, 4, 5].map((n, i) => (
              <div
                key={n}
                className="thumb"
                style={{ background: item.tint, border: `1.5px solid ${thumbBorders[i]}` }}
              >
                {i === 0 && item.image ? (
                  <img src={item.image} alt="" />
                ) : (
                  <span className="tint-label" style={{ fontSize: 9 }}>
                    0{n}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="desc-section">
            <h2>Description</h2>
            <p>{item.desc}</p>
            <div className="meta-row">
              <div>
                <div className="meta-label">Condition</div>
                <div className="meta-val">{item.cond}</div>
              </div>
              <div>
                <div className="meta-label">Pickup</div>
                <div className="meta-val">{item.loc}</div>
              </div>
              <div>
                <div className="meta-label">Distance</div>
                <div className="meta-val">{item.dist}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-right">
          <div className="buy-card">
            <div className="buy-kind">{kindLabel(item.cat)}</div>
            <h1>{item.title}</h1>
            <div className="buy-price">
              {priceLabel(item)}
              {item.unit && <span className="unit">{item.unit}</span>}
            </div>
            {isOwner ? (
              <>
                <div className="buy-actions">
                  <button className="cta" onClick={() => onEdit(item)}>
                    <Icon name="edit" size={17} sw={2} /> Edit listing
                  </button>
                  <button
                    className="sq-btn"
                    style={{ color: "var(--red-deep)", borderColor: "#f3d9d7" }}
                    onClick={() => onDelete(item.id)}
                    title="Delete listing"
                  >
                    <Icon name="trash" size={20} />
                  </button>
                </div>
                <div className="trust-line">This is your listing.</div>
              </>
            ) : (
              <>
                <div className="buy-actions">
                  <button className={`cta ${item.requested ? "done" : ""}`} onClick={() => onRequest(item.id)}>
                    {ctaLabel(item, item.requested)}
                  </button>
                  <button className="sq-btn" title="Message seller" onClick={() => onMessage(item.seller.id)}>
                    <Icon name="chat" size={20} />
                  </button>
                  <button
                    className="sq-btn"
                    style={{ color: item.wished ? "var(--accent)" : "var(--t2)" }}
                    onClick={() => onWish(item.id)}
                    title="Wishlist"
                  >
                    <Icon name="heart" size={20} fill={item.wished ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="trust-line">
                  <span style={{ color: "var(--blue)", display: "flex" }}>
                    <Icon name="shield" size={15} sw={1.9} />
                  </span>
                  Protected by HareIt student verification
                </div>
              </>
            )}
          </div>

          <div className="seller-card">
            <div className="seller-card-row">
              <Avatar name={item.seller.name} av={item.seller.av} size={50} verified={item.seller.verified} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="seller-card-name">{item.seller.name}</div>
                <div className="seller-card-rating">
                  <span style={{ color: "var(--amber)", display: "flex" }}>
                    <Icon name="star" size={13} />
                  </span>
                  {item.seller.rating != null ? item.seller.rating.toFixed(1) : "New"} ·{" "}
                  {item.seller.reviews} reviews
                </div>
              </div>
            </div>
            <div className="trust-chips">
              <span className="trust-chip tc-blue">
                <Icon name="check" size={13} sw={2} />
                Verified student
              </span>
              <span className="trust-chip tc-green">
                <Icon name="check" size={13} sw={2} />
                ID checked
              </span>
              <span className="trust-chip tc-neutral">Replies in ~5 min</span>
            </div>
          </div>
        </div>
      </div>

      <div className="more-nearby">
        <h2>More nearby</h2>
        <div className="row-scroll hi-row" style={{ gap: 16, paddingBottom: 8 }}>
          {nearby.map((it) => (
            <NearbyCard key={it.id} item={it} onOpen={onOpen} showDist={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
