 import { useState, useEffect } from "react";

export default function Sell({ user }) {
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(JSON.parse(localStorage.getItem("sellItems")) || []);
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const post = () => {
    if (!item || !price || !image) {
      alert("Please fill all fields and upload image");
      return;
    }

    const newItem = {
      item,
      price,
      image,
      seller: user.name,
      hostel: user.hostel,
      contact: user.contact
    };

    const updated = [...list, newItem];
    setList(updated);
    localStorage.setItem("sellItems", JSON.stringify(updated));

    setItem("");
    setPrice("");
    setImage("");
  };

  // ✅ ONLY ITEMS POSTED BY CURRENT USER
  const myItems = list.filter(
    (i) => i.seller === user.name && i.contact === user.contact
  );

  return (
    <div className="sell-wrapper">
      <div className="sell-inner">
        <h3>🛒 Sell Item</h3>

       
        <div className="input-group">
          <input
            placeholder="Item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input type="file" accept="image/*" onChange={handleImage} />
        </div>

        {image && (
          <img
            src={image}
            alt="preview"
            style={{
              width: "120px",
              borderRadius: "12px",
              marginBottom: "15px"
            }}
          />
        )}

        <button className="primary-btn" onClick={post}>
          Post Item
        </button>

        
        {myItems.length > 0 && (
          <>
            <hr style={{ margin: "25px 0" }} />
            <h3>📦 Your Posted Items</h3>

            {myItems.map((i, idx) => (
              <div className="item" key={idx}>
                <img
                  src={i.image}
                  alt={i.item}
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "10px",
                    objectFit: "cover"
                  }}
                />
                <div>
                  <b>{i.item}</b><br />
                  ₹{i.price}<br />
                  {i.hostel} | 📞 {i.contact}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
