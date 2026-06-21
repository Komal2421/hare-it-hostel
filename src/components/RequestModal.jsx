import { useState } from "react";
import Modal from "./Modal";
import { api } from "../api";
import { toast } from "../toast";

export default function RequestModal({ onClose, onCreated }) {
  const [item, setItem] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("Borrow");
  const [budget, setBudget] = useState("");
  const [loc, setLoc] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!item.trim()) return setError("What are you looking for?");
    setLoading(true);
    try {
      const created = await api.createRequest({ item, note, mode, budget, loc, urgent });
      toast("Request posted");
      onCreated(created);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Post a request" subtitle="Tell your hostel what you need." onClose={onClose}>
      {error && <div className="form-error">{error}</div>}

      <div className="field">
        <label>What are you looking for?</label>
        <input placeholder="e.g. Hot water kettle for 3 days" value={item} onChange={(e) => setItem(e.target.value)} />
      </div>

      <div className="field">
        <label>Mode</label>
        <div className="seg-group">
          {["Borrow", "Buy"].map((m) => (
            <button key={m} className={`seg-opt ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>Budget</label>
          <input placeholder="₹40/day or up to ₹400" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </div>
        <div className="field">
          <label>Location</label>
          <input placeholder="Hostel 5" value={loc} onChange={(e) => setLoc(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Note</label>
        <textarea placeholder="Any details that help people respond." value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <label className="checkrow">
        <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
        Mark as urgent
      </label>

      <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit} disabled={loading}>
        {loading ? "Posting…" : "Post request"}
      </button>
    </Modal>
  );
}
