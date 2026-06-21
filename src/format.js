export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// "Free" for lend / zero-price; otherwise "₹4,500"
export function priceLabel(item) {
  if (item.cat === "lend" || !item.price) return "Free";
  return "₹" + Number(item.price).toLocaleString("en-IN");
}

export function kindLabel(cat) {
  if (cat === "borrow") return "To borrow";
  if (cat === "lend") return "Free to borrow";
  return "For sale"; // buy | sell
}

// tag colors: sale items -> dark; borrow/lend -> accent
export function kindTag(cat) {
  const sale = cat === "buy" || cat === "sell";
  return {
    background: sale ? "rgba(27,26,23,.82)" : "var(--accent)",
    color: "#fff",
  };
}

export function ctaLabel(item, requested) {
  if (requested) return "Request sent ✓";
  if (item.cat === "buy" || item.cat === "sell") return "Buy now";
  return item.cat === "lend" || !item.price ? "Request to borrow" : "Borrow now";
}
