const ModalContact = () => {
    return (

        <section id="contact">
            <h2>Контакты</h2>
            <div className="contact-info">
                <div className="contact-card">
                    <h3>Телефон</h3>
                    <p>+998 88 188 43 85</p>
                </div>
                <a href="https://maps.app.goo.gl/cPKBW66F5UqQV7kT6?g_st=atm" className="contact-card">
                    <h3>Адрес</h3>
                    <p>123 Ул. Богдодчилик 51, 111904, Tashkent, Tashkent Region</p>
                </a>
                <div className="contact-card">
                    <h3>Режим работы</h3>
                    <p>Пн-Вс: 09:00 - 21:00</p>
                </div>
            </div>
        </section>
    )
}
export default ModalContact;