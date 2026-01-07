const Portfolio = () => {
    return (
        <section id="portfolio">

            <div className="socials-grid">
                {/* Instagram Card */}
                <div className="social-card instagram-card">
                    <svg className="social-icon-large" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.75 2H16.25C19.4256 2 22 4.57437 22 7.75V16.25C22 19.4256 19.4256 22 16.25 22H7.75C4.57437 22 2 19.4256 2 16.25V7.75C2 4.57437 4.57437 2 7.75 2Z" stroke="#c5a059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 11.3701C16.1234 12.2023 15.9813 13.0523 15.5938 13.7991C15.2063 14.5459 14.5932 15.1515 13.8416 15.5297C13.0901 15.908 12.2385 16.0397 11.4078 15.906C10.5771 15.7723 9.80977 15.3801 9.21485 14.7852C8.61992 14.1903 8.22774 13.423 8.09407 12.5923C7.9604 11.7616 8.09207 10.91 8.47033 10.1585C8.8486 9.40693 9.45419 8.79382 10.201 8.40632C10.9478 8.01882 11.7978 7.87667 12.63 8.00008" stroke="#c5a059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17.5 6.5H17.51" stroke="#c5a059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <h3 className="social-text">Наш Instagram</h3>
                    <p className="social-subtext">
                        Свежие стрижки, стиль и атмосфера — всё это в нашем Instagram. Подписывайтесь!
                    </p>

                    <a href="https://www.instagram.com/barbershop_gentlemens_?igsh=dnNkbjNiMnBhOWx6" target="_blank" rel="noopener noreferrer" className="btn">
                        Перейти в Instagram
                    </a>
                </div>

                {/* Telegram Card */}
                <div className="social-card telegram-card">
                    <svg className="social-icon-large" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.9999 1.99991L1.99994 9.99991L9.99994 13.9999L21.9999 1.99991Z" stroke="#c5a059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.99994 13.9999L13.9999 21.9999L21.9999 1.99991L9.99994 13.9999Z" stroke="#c5a059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.99994 14.0001L14.9999 9.00006" stroke="#c5a059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <h3 className="social-text">Наш Telegram</h3>
                    <p className="social-subtext">
                        Запись, новости и акции — всё самое важное в нашем Telegram канале.
                    </p>

                    <a href="https://t.me/B_G_Admin" target="_blank" rel="noopener noreferrer" className="btn">
                        Перейти в Telegram
                    </a>
                </div>
            </div>
        </section>
    );
}
export default Portfolio;