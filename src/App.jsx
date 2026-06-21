import { useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api";
import { toast } from "./toast";
import Login from "./components/Login";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import Discover from "./components/Discover";
import ItemDetail from "./components/ItemDetail";
import Requests from "./components/Requests";
import LostFound from "./components/LostFound";
import ListItemModal from "./components/ListItemModal";
import RequestModal from "./components/RequestModal";
import LostFoundModal from "./components/LostFoundModal";
import ProfileModal from "./components/ProfileModal";
import MessagesDrawer from "./components/MessagesDrawer";
import Toaster from "./components/Toaster";

const HEADERS = {
  all: ["Fresh near you", "New listings from students near you"],
  borrow: ["Borrow", "Rent what you need, by the day"],
  lend: ["Free to borrow", "Lent freely by students nearby"],
  buy: ["Buy", "Second-hand finds from students"],
  sell: ["For sale", "Items students are selling right now"],
  wishlist: ["Your wishlist", "Saved listings you are watching"],
  nearby: ["Nearby in your hostel", "Closest to your room first"],
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const [screen, setScreen] = useState("discover");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("nearest");
  const [showRail, setShowRail] = useState(() => localStorage.getItem("showRail") !== "false");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // 'list' | 'request' | 'lostfound' | 'profile'
  const [editing, setEditing] = useState(null); // listing being edited
  const [msg, setMsg] = useState(null); // null | { initialConvId? }

  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [lostfound, setLostfound] = useState([]);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [responded, setResponded] = useState(() => new Set());

  useEffect(() => {
    if (!getToken()) return;
    api.me().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const refreshConversations = () => api.getConversations().then(setConversations).catch(() => {});
  const loadAll = () => {
    api.getListings().then(setListings).catch((e) => toast(e.message, "error"));
    api.getRequests().then(setRequests).catch(() => {});
    api.getLostFound().then(setLostfound).catch(() => {});
    api.getActivity().then(setActivity).catch(() => {});
    api.getNotifications().then(setNotifications).catch(() => {});
    refreshConversations();
  };
  useEffect(() => {
    if (user) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- derived ----
  const counts = useMemo(() => {
    const c = { borrow: 0, lend: 0, buy: 0, sell: 0 };
    listings.forEach((i) => (c[i.cat] = (c[i.cat] || 0) + 1));
    return c;
  }, [listings]);
  const wishCount = useMemo(() => listings.filter((i) => i.wished).length, [listings]);
  const notifUnread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const msgUnread = useMemo(() => conversations.reduce((s, c) => s + c.unread, 0), [conversations]);

  const listing = useMemo(() => {
    let list = listings;
    if (["borrow", "lend", "buy", "sell"].includes(category)) list = list.filter((i) => i.cat === category);
    else if (category === "wishlist") list = list.filter((i) => i.wished);
    else if (category === "nearby") list = list.filter((i) => i.nearby);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.sub || "").toLowerCase().includes(q) ||
          i.seller.name.toLowerCase().includes(q)
      );
    const arr = [...list];
    if (sort === "newest") arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sort === "priceLow") arr.sort((a, b) => a.price - b.price);
    else if (sort === "priceHigh") arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [listings, category, search, sort]);

  const selected = useMemo(() => listings.find((i) => i.id === selectedId) || null, [listings, selectedId]);
  const [hTitle, hSub] = HEADERS[category] || HEADERS.all;

  // ---- handlers ----
  const handleLogin = ({ token, user }) => {
    setToken(token);
    setUser(user);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    setScreen("discover");
    setCategory("all");
  };

  const nav = (target) => {
    if (target === "requests" || target === "lostfound") setScreen(target);
    else {
      setScreen("discover");
      setCategory(target);
    }
    window.scrollTo({ top: 0 });
  };
  const openItem = (id) => {
    window.scrollTo({ top: 0 });
    setSelectedId(id);
    setScreen("detail");
  };
  const onSearchSubmit = () => {
    setScreen("discover");
    window.scrollTo({ top: 0 });
  };

  const onWish = async (id) => {
    setListings((p) => p.map((i) => (i.id === id ? { ...i, wished: !i.wished } : i)));
    try {
      await api.toggleWish(id);
    } catch (e) {
      toast(e.message, "error");
      setListings((p) => p.map((i) => (i.id === id ? { ...i, wished: !i.wished } : i)));
    }
  };
  const onRequestToggle = async (id) => {
    setListings((p) => p.map((i) => (i.id === id ? { ...i, requested: !i.requested } : i)));
    try {
      const r = await api.toggleRequest(id);
      toast(r.requested ? "Request sent to the owner" : "Request withdrawn");
    } catch (e) {
      toast(e.message, "error");
      setListings((p) => p.map((i) => (i.id === id ? { ...i, requested: !i.requested } : i)));
    }
  };
  const onOffer = async (reqId) => {
    try {
      const r = await api.offerRequest(reqId);
      setRequests((p) => p.map((q) => (q.id === reqId ? { ...q, replies: r.replies, offered: true } : q)));
      toast("Offer sent");
    } catch (e) {
      toast(e.message, "error");
    }
  };
  const onRespond = async (lfId) => {
    try {
      await api.respondLostFound(lfId);
      setResponded((p) => new Set(p).add(lfId));
      toast("The owner has been notified");
    } catch (e) {
      toast(e.message, "error");
    }
  };
  const onOpenNotifs = () => {
    if (notifUnread === 0) return;
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    api.readNotifications().catch(() => {});
  };
  const onChangeCampus = async (campus) => {
    try {
      setUser(await api.updateProfile({ campus }));
      toast("Campus updated");
    } catch (e) {
      toast(e.message, "error");
    }
  };
  const onDeleteListing = async (id) => {
    try {
      await api.deleteListing(id);
      setListings((p) => p.filter((i) => i.id !== id));
      setScreen("discover");
      toast("Listing deleted");
    } catch (e) {
      toast(e.message, "error");
    }
  };
  const toggleRail = () => {
    setShowRail((s) => {
      localStorage.setItem("showRail", String(!s));
      return !s;
    });
  };
  const openMessages = () => {
    refreshConversations();
    setMsg({});
  };
  const messageUser = async (userId) => {
    if (userId === user.id) return toast("That's your own listing", "info");
    try {
      const { id } = await api.openConversation(userId);
      await refreshConversations();
      setMsg({ initialConvId: id });
    } catch (e) {
      toast(e.message, "error");
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return (<><Login onLogin={handleLogin} /><Toaster /></>);

  return (
    <>
      <TopBar
        user={user}
        wishCount={wishCount}
        search={search}
        setSearch={setSearch}
        onSearchSubmit={onSearchSubmit}
        notifications={notifications}
        notifUnread={notifUnread}
        onOpenNotifs={onOpenNotifs}
        msgUnread={msgUnread}
        onMessages={openMessages}
        onChangeCampus={onChangeCampus}
        onEditProfile={() => setModal("profile")}
        onLogo={() => nav("discover")}
        onWishlist={() => nav("wishlist")}
        onListItem={() => setModal("list")}
        onLogout={logout}
      />
      <div className="shell">
        <Sidebar
          screen={screen}
          category={category}
          counts={counts}
          wishCount={wishCount}
          requestsCount={requests.length}
          onNav={nav}
        />
        <main className="main">
          {screen === "discover" && (
            <Discover
              listing={listing}
              itemsAll={listings}
              view={view}
              setView={setView}
              sort={sort}
              setSort={setSort}
              headerTitle={hTitle}
              headerSub={hSub}
              showNearby={["all", "nearby"].includes(category)}
              showRail={showRail}
              onToggleRail={toggleRail}
              activity={activity}
              requestsTop={requests.slice(0, 3)}
              campus={user.campus}
              pageKey={`${category}|${search}|${sort}`}
              onOpen={openItem}
              onWish={onWish}
              onNav={nav}
            />
          )}
          {screen === "detail" && (
            <ItemDetail
              item={selected}
              nearby={listings.filter((i) => i.nearby && i.id !== selectedId)}
              isOwner={selected && selected.owner_id === user.id}
              onBack={() => setScreen("discover")}
              onOpen={openItem}
              onWish={onWish}
              onRequest={onRequestToggle}
              onMessage={messageUser}
              onEdit={(it) => setEditing(it)}
              onDelete={onDeleteListing}
            />
          )}
          {screen === "requests" && (
            <Requests requests={requests} onPost={() => setModal("request")} onOffer={onOffer} />
          )}
          {screen === "lostfound" && (
            <LostFound
              items={lostfound}
              responded={responded}
              onReport={() => setModal("lostfound")}
              onRespond={onRespond}
            />
          )}
        </main>
      </div>

      {modal === "list" && (
        <ListItemModal
          onClose={() => setModal(null)}
          onSaved={(it) => {
            setListings((p) => [it, ...p]);
            api.getActivity().then(setActivity).catch(() => {});
          }}
        />
      )}
      {editing && (
        <ListItemModal
          existing={editing}
          onClose={() => setEditing(null)}
          onSaved={(it) => setListings((p) => p.map((x) => (x.id === it.id ? it : x)))}
        />
      )}
      {modal === "request" && (
        <RequestModal
          onClose={() => setModal(null)}
          onCreated={(r) => {
            setRequests((p) => [r, ...p]);
            api.getActivity().then(setActivity).catch(() => {});
          }}
        />
      )}
      {modal === "lostfound" && (
        <LostFoundModal onClose={() => setModal(null)} onCreated={(l) => setLostfound((p) => [l, ...p])} />
      )}
      {modal === "profile" && (
        <ProfileModal user={user} onClose={() => setModal(null)} onSaved={setUser} />
      )}

      {msg && (
        <MessagesDrawer
          conversations={conversations}
          initialConvId={msg.initialConvId}
          onClose={() => {
            setMsg(null);
            refreshConversations();
          }}
          onChanged={refreshConversations}
        />
      )}

      <Toaster />
    </>
  );
}
