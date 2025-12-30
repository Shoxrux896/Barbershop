import { useState } from "react";

export default function ContactModal() {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <>
      <button className="contact-icon" onClick={openModal}>Связаться</button>

      {open && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>
              ✕
            </button>
            <div className="modal-info">
              <h2>Шохжахон</h2>
              <h2>Мастер</h2>
            </div>

            <p className="modal-phone">+998 88 188 43 85</p>

            <div className="social-links">
              <a href="https://www.instagram.com/barbershop_gentlemens_?igsh=dnNkbjNiMnBhOWx6" className="social-link" target="_blank" rel="noopener noreferrer">
          
                <span>Инстаграм</span>
              </a>
              <a href="https://t.me/Gentelmens_Barbershop" className="social-link" target="_blank" rel="noopener noreferrer">
              
                <span>Телеграм</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
