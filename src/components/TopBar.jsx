import { useState } from "react";
import { Icon } from "./icons";
import { Avatar, Stars } from "./ui";

const CAMPUSES = [
  "IIT Bombay · Hostel 12",
  "IIT Bombay · Hostel 9",
  "IIT Bombay · Hostel 7",
  "IIT Bombay · Hostel 5",
];

export default function TopBar({
  user,
  wishCount,
  search,
  setSearch,
  onSearchSubmit,
  notifications,
  notifUnread,
  onOpenNotifs,
  msgUnread,
  onMessages,
  onChangeCampus,
  onEditProfile,
  onLogo,
  onWishlist,
  onListItem,
  onLogout,
}) {
  const [open, setOpen] = useState(null); // 'notifs' | 'campus' | null

  const toggle = (which) => {
    setOpen((o) => (o === which ? null : which));
    if (which === "notifs" && open !== "notifs") onOpenNotifs();
  };

  const campuses = CAMPUSES.includes(user.campus) ? CAMPUSES : [user.campus, ...CAMPUSES];

  return (
    <header className="topbar">
      <div className="brand" onClick={onLogo}>
        <div className="brand-mark">H</div>
        <span className="brand-name">HareIt</span>
      </div>

      <div className="pop-wrap">
        <div className="campus-pill" onClick={() => toggle("campus")}>
          <Icon name="pin" size={15} sw={1.9} />
          <span>{user.campus}</span>
          <Icon name="chevron" size={13} sw={2} />
        </div>
        {open === "campus" && (
          <>
            <div className="pop-backdrop" onClick={() => setOpen(null)} />
            <div className="popover menu left">
              {campuses.map((c) => (
                <button
                  key={c}
                  className={`menu-item ${c === user.campus ? "active" : ""}`}
                  onClick={() => {
                    onChangeCampus(c);
                    setOpen(null);
                  }}
                >
                  <Icon name="pin" size={15} sw={1.9} />
                  {c}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <form
        className="searchbar"
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit();
        }}
      >
        <Icon name="search" size={18} sw={1.9} />
        <input
          placeholder="Search fans, cycles, calculators, books…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="search-clear" onClick={() => setSearch("")} title="Clear">
            <Icon name="close" size={16} sw={2} />
          </button>
        )}
        <button type="submit" className="btn-search">
          Search
        </button>
      </form>

      <div className="spacer" />

      <button className="btn-primary" onClick={onListItem}>
        <Icon name="plus" size={17} sw={2.2} />
        <span className="lbl-text">List an item</span>
      </button>

      <div className="iconbtns">
        <button className="iconbtn" onClick={onWishlist} title="Wishlist">
          <Icon name="heart" size={20} />
          {wishCount > 0 && <span className="badge-count">{wishCount}</span>}
        </button>

        <div className="pop-wrap">
          <button className="iconbtn" onClick={() => toggle("notifs")} title="Notifications">
            <Icon name="bell" size={20} />
            {notifUnread > 0 && <span className="badge-count">{notifUnread}</span>}
          </button>
          {open === "notifs" && (
            <>
              <div className="pop-backdrop" onClick={() => setOpen(null)} />
              <div className="popover notif-panel">
                <div className="popover-head">
                  <h4>Notifications</h4>
                </div>
                {notifications.length === 0 ? (
                  <div className="pop-empty">You're all caught up 🎉</div>
                ) : (
                  notifications.map((n) => (
                    <div className={`notif-item ${n.read ? "" : "unread"}`} key={n.id}>
                      <Avatar name={n.who} av={n.av} size={36} verified={n.verified} />
                      <div style={{ minWidth: 0 }}>
                        <div className="notif-text">
                          <b>{n.who}</b> {n.text}
                        </div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <button className="iconbtn" onClick={onMessages} title="Messages">
          <Icon name="chat" size={20} />
          {msgUnread > 0 && <span className="badge-count">{msgUnread}</span>}
        </button>

        <div className="pop-wrap" style={{ marginLeft: 8 }}>
          <div style={{ cursor: "pointer" }} onClick={() => toggle("profile")} title="Profile">
            <Avatar name={user.name} av={user.avatar} size={40} verified={user.verified} ring />
          </div>
          {open === "profile" && (
            <>
              <div className="pop-backdrop" onClick={() => setOpen(null)} />
              <div className="popover profile-menu">
                <div className="profile-menu-head">
                  <Avatar name={user.name} av={user.avatar} size={44} verified={user.verified} />
                  <div style={{ minWidth: 0 }}>
                    <div className="profile-menu-name">{user.name}</div>
                    <div className="profile-meta">
                      <Stars value={user.rating} /> · {user.deals} deals
                    </div>
                  </div>
                </div>
                <button
                  className="menu-item"
                  onClick={() => {
                    setOpen(null);
                    onEditProfile();
                  }}
                >
                  <Icon name="user" size={17} sw={1.9} />
                  Edit profile
                </button>
                <button
                  className="menu-item"
                  style={{ color: "var(--red-deep)" }}
                  onClick={() => {
                    setOpen(null);
                    onLogout();
                  }}
                >
                  <Icon name="logout" size={17} sw={1.9} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
