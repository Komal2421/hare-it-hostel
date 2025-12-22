 import { useState, useEffect } from "react";

export default function LendItem({ user }) {
  const [item, setItem] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("lendItems")) || []);
  }, []);

  const addItem = () => {
    if (!item.trim()) return;

    const newItem = {
      item,
      name: user.name,
      hostel: user.hostel,
      contact: user.contact
    };

    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem("lendItems", JSON.stringify(updated));
    setItem("");
  };

  return (
    <div className="lend-hero">
     
      <div className="lend-left">
        <h3>🤝 Lend Item</h3>

        <div className="lend-input">
          <span>🔍</span>
          <input
            placeholder="Enter item name (Iron, Book, Kettle)"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>

        <div className="lend-btn-row">
          <button className="lend-btn" onClick={addItem}>
            Post Item
          </button>

          
          <div className="lend-note">
            Your item will be visible to all hostel students
          </div>
        </div>
      </div>

      
      <div className="lend-right">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2702/2702134.png"
          alt="Lend Illustration"
        />
      </div>
    </div>
  );
}
