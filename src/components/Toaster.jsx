import { useEffect, useState } from "react";
import { subscribeToast } from "../toast";
import { Icon } from "./icons";

const ICON = { success: "check", error: "close", info: "plus" };

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3200);
    });
  }, []);

  return (
    <div className="toaster">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            <Icon name={ICON[t.type] || "check"} size={15} sw={3} />
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
