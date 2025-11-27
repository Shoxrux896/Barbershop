const ModalContact = () =>{
    return(

 <section id="contact">
        <h2>Контакты</h2>
        <div className="contact-info">
            <div className="contact-card">
                <h3>📞 Телефон</h3>
                <p style={{ color: '#ccc' }}>+998 90 123 45 67</p>
            </div>
            <div className="contact-card">
                <h3>📍 Адрес</h3>
                <p style={{ color: '#ccc' }}>г. Ташкент, ул. Примерная, 123</p>
            </div>
            <div className="contact-card">
                <h3>⏰ Режим работы</h3>
                <p style={{ color: '#ccc' }}>Пн-Вс: 09:00 - 20:00</p>
            </div>
        </div>
    </section>
    )
}
export default ModalContact;