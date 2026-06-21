import { useRef, useState } from "react";
import Modal from "./Modal";
import { Icon } from "./icons";
import { api } from "../api";
import { toast } from "../toast";

const CATS = [
  { value: "sell", label: "Sell — for sale" },
  { value: "buy", label: "Buy — for sale" },
  { value: "borrow", label: "Rent out — ₹/day" },
  { value: "lend", label: "Lend — free" },
];
const CONDITIONS = ["Like new", "Good", "Fair"];

export default function ListItemModal({ onClose, onSaved, existing }) {
  const editing = Boolean(existing);
  const [title, setTitle] = useState(existing?.title || "");
  const [cat, setCat] = useState(existing?.cat || "sell");
  const [price, setPrice] = useState(existing?.price ? String(existing.price) : "");
  const [sub, setSub] = useState(existing?.sub || "");
  const [condition, setCondition] = useState(existing?.cond || "Good");
  const [location, setLocation] = useState(existing?.loc || "");
  const [description, setDescription] = useState(existing?.desc || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(existing?.image || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const needsPrice = cat !== "lend";

  const pickImage = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setError("");
    if (!title.trim()) return setError("Give your item a name.");
    if (needsPrice && !(Number(price) > 0)) return setError("Enter a valid price.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("cat", cat);
      if (needsPrice) fd.append("price", price);
      fd.append("sub", sub);
      fd.append("condition", condition);
      fd.append("location", location);
      fd.append("description", description);
      if (file) fd.append("image", file);
      const result = editing ? await api.updateListing(existing.id, fd) : await api.createListing(fd);
      toast(editing ? "Listing updated" : `"${result.title}" is now live`);
      onSaved(result);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editing ? "Edit listing" : "List an item"}
      subtitle={editing ? "Update your listing details or photo." : "Share something to sell, lend or rent out."}
      onClose={onClose}
    >
      {error && <div className="form-error">{error}</div>}

      <div className="field">
        <label>Item name</label>
        <input placeholder="e.g. Trek Marlin Cycle" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="field-row">
        <div className="field">
          <label>Type</label>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {CATS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        {needsPrice && (
          <div className="field">
            <label>Price {cat === "borrow" ? "(₹/day)" : "(₹)"}</label>
            <input type="number" min="1" placeholder="500" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label>Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Pickup location</label>
          <input placeholder="Hostel 12 · Rm 214" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Short tagline</label>
        <input placeholder="21-speed, barely used" value={sub} onChange={(e) => setSub(e.target.value)} />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea placeholder="Tell buyers about the condition, pickup, etc." value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="field">
        <label>Photo {editing ? "" : "(optional)"}</label>
        {preview ? (
          <div className="preview">
            <img src={preview} alt="preview" />
            <button onClick={() => fileRef.current?.click()} title="Change photo">
              <Icon name="image" size={16} sw={2} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => pickImage(e.target.files[0])} />
          </div>
        ) : (
          <div className="dropzone" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={24} />
            <div style={{ marginTop: 6 }}>
              <strong>Click to upload</strong> · JPG, PNG, WEBP, GIF (max 5 MB)
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pickImage(e.target.files[0])} />
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit} disabled={loading}>
        {loading ? "Saving…" : editing ? "Save changes" : "Post listing"}
      </button>
    </Modal>
  );
}
