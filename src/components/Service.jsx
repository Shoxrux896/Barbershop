const Service = () =>{

    return (

        <section id="services">
        <h2>Наши услуги</h2>
        <div className="services-grid">
            <div className="service-card">
                <h3>Классическая стрижка</h3>
                <p>Традиционная мужская стрижка с укладкой. Идеальный образ для повседневной жизни и особых случаев.</p>
                <div className="price">1500₽</div>
            </div>
            <div className="service-card">
                <h3>Фейд</h3>
                <p>Модная стрижка с плавным переходом. Современный стиль, который подчеркнет вашу индивидуальность.</p>
                <div className="price">2000₽</div>
            </div>
            <div className="service-card">
                <h3>Стрижка бороды</h3>
                <p>Моделирование и уход за бородой. Опрятный внешний вид и ухоженность гарантированы.</p>
                <div className="price">1000₽</div>
            </div>
            <div className="service-card">
                <h3>Комплекс</h3>
                <p>Стрижка + борода + укладка. Полный образ от профессионала. Экономия 500₽!</p>
                <div className="price">3500₽</div>
            </div>
        </div>
    </section>
    );
}
export default Service;
