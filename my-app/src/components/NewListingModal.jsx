import { useState } from "react";
import Modal from "./Modal.jsx";

function NewListingModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    type: "request",
    title: "",
    desc: "",
    from: "",
    to: "",
    price: "",
    urgent: false,
  });

  const handle = async () => {
    if (!form.title || !form.from || !form.to || !form.price) return;
    const ok = await onSubmit(form);
    if (ok) onClose();
  };

  return (
    <Modal
      title={form.type === "request" ? "📦 طلب توصيل" : "🚚 عرض توصيل"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            إلغاء
          </button>
          <button className="btn btn-primary" onClick={handle}>
            نشر الإعلان
          </button>
        </>
      }
    >
      <div className="modal-toggle-row">
        {["request", "offer"].map((t) => (
          <button
            key={t}
            className={`btn ${form.type === t ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setForm({ ...form, type: t })}
          >
            {t === "request" ? "📦 أحتاج توصيلا" : "🚚 أستطيع التوصيل"}
          </button>
        ))}
      </div>
      <div className="input-wrap">
        <label className="input-label">العنوان</label>
        <input
          className="input"
          placeholder="وصف مختصر للتوصيل"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="input-wrap">
        <label className="input-label">التفاصيل</label>
        <textarea
          className="input"
          placeholder="حجم الطرد والوزن والتعليمات الخاصة…"
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
        />
      </div>
      <div className="modal-grid-2">
        <div className="input-wrap">
          <label className="input-label">من</label>
          <input
            className="input"
            placeholder="مدينة الانطلاق"
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
          />
        </div>
        <div className="input-wrap">
          <label className="input-label">إلى</label>
          <input
            className="input"
            placeholder="الوجهة"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
          />
        </div>
      </div>
      <div className="modal-grid-2">
        <div className="input-wrap">
          <label className="input-label">السعر (شيكل)</label>
          <input
            className="input"
            type="number"
            placeholder="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div className="input-wrap modal-urgent">
          <label className="input-label">عاجل؟</label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            <input
              type="checkbox"
              checked={form.urgent}
              onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
              style={{ accentColor: "var(--brand)", width: 16, height: 16 }}
            />
            <span style={{ fontSize: ".88rem" }}>وضع علامة عاجل</span>
          </label>
        </div>
      </div>
    </Modal>
  );
}

export default NewListingModal;
