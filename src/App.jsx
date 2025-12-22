 import { useEffect, useState } from "react";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import LendItem from "./components/LendItem";
import AvailableItems from "./components/AvailableItems";
import Sell from "./components/Sell";
import Buy from "./components/Buy";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("lend");

  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved) setUser(saved);
  },[]);

  if (!user) return <Login onLogin={setUser} />;

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      <Navbar setPage={setPage} user={user} logout={logout} />
      <div className="container">
        {page === "lend" && <LendItem user={user} />}
        {page === "available" && <AvailableItems />}
        {page === "sell" && <Sell user={user} />}
        {page === "buy" && <Buy />}
      </div>
    </>
  );
}
