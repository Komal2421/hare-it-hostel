export const TINTS = [
  "#E4DECF",
  "#D9E2D8",
  "#DCE0E6",
  "#E7D8CF",
  "#E8DDE0",
  "#DEE0D7",
  "#D6E1DC",
];

export const AVATARS = ["#E7CFC2", "#CBD8E0", "#D8CFE0", "#E0D6C2", "#D0DCD2", "#E2CFD3"];

export function pick(arr, str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

export function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Compact seller/actor shape used inside listings, requests, activity, etc.
export function seller(row, prefix = "u_") {
  const name = row[`${prefix}name`];
  return {
    id: row[`${prefix}id`],
    name,
    rating: row[`${prefix}rating`] != null ? Number(row[`${prefix}rating`]) : null,
    reviews: row[`${prefix}reviews`] ?? 0,
    verified: row[`${prefix}verified`] ?? false,
    init: initials(name),
    av: row[`${prefix}avatar`] || pick(AVATARS, name || ""),
  };
}

export function relativeTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const secs = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
