import { useState } from "react";
import Modal from "./Modal";
import { Avatar } from "./ui";
import { api } from "../api";
import { toast } from "../toast";

const COLORS = [
  "#E7CFC2",
  "#CBD8E0",
  "#D8CFE0",
  "#E0D6C2",
  "#D0DCD2",
  "#E2CFD3",
  "#E2C7C0",
  "#CFE0DA",
];

export default function ProfileModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user.name);
  const [campus, setCampus] = useState(user.campus);
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Name can't be empty.");
    setLoading(true);
    try {
      const u = await api.updateProfile({ name, campus, avatar });
      toast("Profile updated");
      onSaved(u);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit profile" subtitle="Customize how you appear to other students." onClose={onClose}>
      {error && <div className="form-error">{error}</div>}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <Avatar name={name || "?"} av={avatar} size={72} verified={user.verified} />
      </div>

      <div className="field">
        <label>Display name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>

      <div className="field">
        <label>Campus · Hostel</label>
        <input value={campus} onChange={(e) => setCampus(e.target.value)} placeholder="IIT Bombay · Hostel 12" />
      </div>

      <div className="field">
        <label>Avatar color</label>
        <div className="swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${avatar === c ? "active" : ""}`}
              style={{ background: c }}
              onClick={() => setAvatar(c)}
              title={c}
            />
          ))}
        </div>
      </div>

      <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit} disabled={loading}>
        {loading ? "Saving…" : "Save profile"}
      </button>
    </Modal>
  );
}
