 import { useEffect, useState } from "react";

export default function Buy() {
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("sellItems")) || []);
  }, []);

  return (
    <>
      <div className="hero-card">
        <div className="hero-title">🛍 Items for Sale</div>

        <div className="hero-list">
          {items.length === 0 && <p>No items for sale</p>}

          {items.map((i, idx) => (
            <div className="hero-item" key={idx}>
             
              <img
                src={i.image}
                alt={i.item}
                className="click-img"
                onClick={() => setSelectedImage(i.image)}
              />

              <div>
                <b>{i.item}</b>
                <div className="hero-meta">
                  ₹{i.price} <br />
                  {i.seller} ({i.hostel}) <br />
                  📞 {i.contact}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      {selectedImage && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </span>
            <img src={selectedImage} alt="Full View" />
          </div>
        </div>
      )}
    </>
  );
}
