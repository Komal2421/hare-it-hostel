import { useRef, useState } from "react";
import Modal from "./Modal";
import { Icon } from "./icons";
import { api } from "../api";
import { toast } from "../toast";

export default function LostFoundModal({ onClose, onCreated }) {
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const pickImage = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    setError("");
    if (!title.trim()) return setError("Describe the item.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("title", title);
      fd.append("place", place);
      if (file) fd.append("image", file);
      const created = await api.createLostFound(fd);
      toast(type === "lost" ? "Lost item reported" : "Found item posted");
      onCreated(created);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Report an item" subtitle="Lost something or found something? Post it here." onClose={onClose}>
      {error && <div className="form-error">{error}</div>}

      <div className="field">
        <label>Type</label>
        <div className="seg-group">
          {[
            ["lost", "I lost this"],
            ["found", "I found this"],
          ].map(([v, l]) => (
            <button key={v} className={`seg-opt ${type === v ? "active" : ""}`} onClick={() => setType(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Item</label>
        <input placeholder="e.g. Black Wildcraft backpack" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="field">
        <label>Where</label>
        <input placeholder="Central Library, 2nd floor" value={place} onChange={(e) => setPlace(e.target.value)} />
      </div>

      <div className="field">
        <label>Photo (optional)</label>
        {preview ? (
          <div className="preview">
            <img src={preview} alt="preview" />
            <button
              onClick={() => {
                setFile(null);
                setPreview("");
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              <Icon name="close" size={16} sw={2.2} />
            </button>
          </div>
        ) : (
          <div className="dropzone" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={24} />
            <div style={{ marginTop: 6 }}>
              <strong>Click to upload</strong> a photo
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => pickImage(e.target.files[0])} />
          </div>
        )}
      </div>

      <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit} disabled={loading}>
        {loading ? "Posting…" : "Post"}
      </button>
    </Modal>
  );
}
