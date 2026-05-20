import { useState } from "react";
import Modal from "./Modal.jsx";

function ContactModal({ listing, onClose }) {
  const typeLabel =
    listing.type === "request"
      ? "طلب توصيل"
      : listing.type === "offer"
        ? "عرض توصيل"
        : "إعلان توصيل";

  const [msg, setMsg] = useState(
    `مرحبًا! أنا مهتم بـ ${typeLabel} من ${listing.from} إلى ${listing.to}.`,
  );
  function handleContact() {
    if (listing.phoneNumber) {
      window.location.href = `tel:${listing.phoneNumber}`;
    } else {
      alert("لا يوجد رقم هاتف لهذا الإعلان");
    }
  }
  return (
    <Modal
      title={`💬 تواصل مع ${listing.user}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handleContact}>
            الاتصال بـ {listing.user}
          </button>
        </>
      }
    >
      <div className="contact-summary">
        <div className="contact-summary__title">{listing.title}</div>
        <div className="contact-summary__row">
          <span
            className={`tag ${listing.type === "request" ? "tag-request" : "tag-offer"}`}
          >
            {typeLabel}
          </span>
          <span>
            📍 {listing.from} → {listing.to}
          </span>
          <span className="contact-summary__price">
            {listing.price} {listing.currency}
          </span>
        </div>
        {listing.phoneNumber && (
          <div className="contact-summary__phone">📞 {listing.phoneNumber}</div>
        )}
      </div>
    </Modal>
  );
}

export default ContactModal;
