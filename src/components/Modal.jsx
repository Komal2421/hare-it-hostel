import { Icon } from "./icons";

export default function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="modal-close" onClick={onClose}>
            <Icon name="close" size={18} sw={2.2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
