 import { useEffect, useState } from "react";

export default function AvailableItems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("lendItems")) || []);
  }, []);

  return (
    <div className="hero-card">
      <div className="hero-title">📦 Available Items</div>

      <div className="hero-list">
        {items.length === 0 && <p>No items available</p>}

        {items.map((i, idx) => (
          <div className="hero-item" key={idx}>
            <div>
              <b>{i.item}</b>
              <div className="hero-meta">
                {i.name} ({i.hostel}) <br />
                📞 {i.contact}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
