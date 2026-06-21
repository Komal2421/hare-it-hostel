import { useState } from "react";
import { Icon } from "./icons";
import { Avatar } from "./ui";
import { ListingCard, ListingRow, NearbyCard } from "./cards";

const SORTS = [
  ["nearest", "Nearest"],
  ["newest", "Newest"],
  ["priceLow", "Price: Low to High"],
  ["priceHigh", "Price: High to Low"],
];
const PAGE = 12;

function NearbyRail({ items, campus, onOpen, onSeeAll }) {
  return (
    <section className="nearby">
      <div className="nearby-head">
        <div className="nearby-title">
          <span style={{ color: "var(--accent)", display: "flex" }}>
            <Icon name="pin" size={19} sw={1.9} />
          </span>
          <h2>Nearby in {campus}</h2>
        </div>
        <button className="link-accent" onClick={onSeeAll}>
          See all
        </button>
      </div>
      <div className="row-scroll hi-row" style={{ gap: 16, paddingBottom: 8 }}>
        {items.map((it) => (
          <NearbyCard key={it.id} item={it} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function RightRail({ activity, requestsTop, onOpen, onRequests }) {
  return (
    <aside className="rail">
      <section className="rail-card">
        <div className="rail-head">
          <h3>Activity</h3>
          <span className="muted">Live</span>
        </div>
        <div className="feed">
          {activity.map((a) => (
            <div
              className="feed-item"
              key={a.id}
              onClick={a.listingId ? () => onOpen(a.listingId) : undefined}
              style={{ cursor: a.listingId ? "pointer" : "default" }}
            >
              <Avatar name={a.who} av={a.av} size={34} verified={a.verified} />
              <div style={{ minWidth: 0, paddingTop: 1 }}>
                <div className="feed-text">
                  <b>{a.who}</b> {a.verb} <b>{a.item}</b>
                  {a.tail}
                </div>
                <div className="feed-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rail-card">
        <div className="rail-head">
          <h3>Top requests</h3>
          <button className="link-accent" style={{ fontSize: 12.5 }} onClick={onRequests}>
            Board
          </button>
        </div>
        <div className="topreq">
          {requestsTop.map((r) => (
            <div className="topreq-item" key={r.id} onClick={onRequests} style={{ cursor: "pointer" }}>
              <div className="topreq-tile">
                <Icon name="search" size={16} sw={1.9} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="ti">{r.item}</div>
                <div className="tw">
                  {r.who} · {r.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default function Discover({
  listing,
  itemsAll,
  view,
  setView,
  sort,
  setSort,
  headerTitle,
  headerSub,
  showNearby,
  showRail,
  onToggleRail,
  activity,
  requestsTop,
  campus,
  pageKey,
  onOpen,
  onWish,
  onNav,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  // pagination keyed to the active filter; resets to PAGE when the filter/sort changes
  const [pg, setPg] = useState({ key: pageKey, n: PAGE });
  const visible = pg.key === pageKey ? pg.n : PAGE;

  const nearbyItems = itemsAll.filter((i) => i.nearby);
  const sortLabel = SORTS.find(([v]) => v === sort)?.[1] || "Nearest";
  const shown = listing.slice(0, visible);

  return (
    <div className="discover">
      <div className="discover-col">
        {showNearby && (
          <NearbyRail items={nearbyItems} campus={campus} onOpen={onOpen} onSeeAll={() => onNav("nearby")} />
        )}

        <div className="listings-head">
          <div>
            <h1>{headerTitle}</h1>
            <p>{headerSub}</p>
          </div>
          <div className="head-tools">
            <div className="pop-wrap">
              <div className="sort-pill" onClick={() => setSortOpen((o) => !o)}>
                <Icon name="sliders" size={15} sw={1.9} />
                Sort: {sortLabel}
                <Icon name="chevron" size={13} sw={2} />
              </div>
              {sortOpen && (
                <>
                  <div className="pop-backdrop" onClick={() => setSortOpen(false)} />
                  <div className="popover menu">
                    {SORTS.map(([v, l]) => (
                      <button
                        key={v}
                        className={`menu-item ${sort === v ? "active" : ""}`}
                        onClick={() => {
                          setSort(v);
                          setSortOpen(false);
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="segmented">
              <button className={`seg ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>
                <Icon name="gridView" size={17} sw={1.9} />
              </button>
              <button className={`seg ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
                <Icon name="listView" size={17} sw={1.9} />
              </button>
            </div>
            <button
              className={`icon-toggle ${showRail ? "active" : ""}`}
              onClick={onToggleRail}
              title={showRail ? "Hide activity panel" : "Show activity panel"}
            >
              <Icon name="panel" size={17} sw={1.9} />
            </button>
          </div>
        </div>

        {listing.length === 0 ? (
          <div className="empty">
            <div className="et">Nothing here yet</div>
            <div className="es">Try a different filter, or tap the heart on a listing to save it.</div>
          </div>
        ) : (
          <>
            {view === "grid" ? (
              <div className="grid">
                {shown.map((it) => (
                  <ListingCard key={it.id} item={it} onOpen={onOpen} onWish={onWish} />
                ))}
              </div>
            ) : (
              <div className="list">
                {shown.map((it) => (
                  <ListingRow key={it.id} item={it} onOpen={onOpen} onWish={onWish} />
                ))}
              </div>
            )}
            {visible < listing.length && (
              <div className="load-more-wrap">
                <button className="btn-ghost-wide" onClick={() => setPg({ key: pageKey, n: visible + PAGE })}>
                  Load more · {listing.length - visible} left
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showRail && (
        <RightRail
          activity={activity}
          requestsTop={requestsTop}
          onOpen={onOpen}
          onRequests={() => onNav("requests")}
        />
      )}
    </div>
  );
}
