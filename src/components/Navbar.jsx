 export default function Navbar({ setPage, user, logout }) {
  return (
    <div className="navbar">
      <h2>hare-It</h2>

      <div>
        <button onClick={()=>setPage("lend")}>Lend</button>
        <button onClick={()=>setPage("available")}>Available</button>
        <button onClick={()=>setPage("sell")}>Sell</button>
        <button onClick={()=>setPage("buy")}>Buy</button>
      </div>

      <div>
        <span>{user.name} | {user.hostel}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
