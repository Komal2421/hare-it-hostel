import { Icon } from "./icons";

function NavItem({ icon, label, active, count, dot, stroke, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <span style={stroke ? { color: stroke } : undefined}>
        <Icon name={icon} size={18} />
      </span>
      <span className="lbl">{label}</span>
      {count ? <span className="nav-count">{count}</span> : null}
      {dot ? <span className="nav-dot" /> : null}
    </button>
  );
}

export default function Sidebar({ screen, category, counts, wishCount, requestsCount, onNav }) {
  const disc = screen === "discover";
  const homeActive = disc && (category === "all" || category === "nearby");

  return (
    <aside className="sidebar">
      <div className="side-head">Marketplace</div>
      <nav className="side-nav">
        <NavItem icon="discover" label="Discover" active={homeActive} onClick={() => onNav("discover")} />
        <NavItem icon="chat" label="Requests" active={screen === "requests"} count={requestsCount} onClick={() => onNav("requests")} />
        <NavItem icon="lostfound" label="Lost & Found" active={screen === "lostfound"} onClick={() => onNav("lostfound")} />
      </nav>

      <div className="side-head mt">Browse by</div>
      <nav className="side-nav">
        <NavItem icon="borrow" label="Borrow" active={disc && category === "borrow"} count={counts.borrow} onClick={() => onNav("borrow")} />
        <NavItem icon="lend" label="Lend" active={disc && category === "lend"} count={counts.lend} onClick={() => onNav("lend")} />
        <NavItem icon="buy" label="Buy" active={disc && category === "buy"} count={counts.buy} onClick={() => onNav("buy")} />
        <NavItem icon="sell" label="Sell" active={disc && category === "sell"} count={counts.sell} onClick={() => onNav("sell")} />
      </nav>

      <div className="side-head mt">Quick access</div>
      <nav className="side-nav">
        <NavItem icon="pinDot" label="Nearby items" active={disc && category === "nearby"} stroke="var(--t3)" onClick={() => onNav("nearby")} />
        <NavItem icon="heart" label="Wishlist" active={disc && category === "wishlist"} count={wishCount} stroke="var(--t3)" onClick={() => onNav("wishlist")} />
      </nav>
    </aside>
  );
}
