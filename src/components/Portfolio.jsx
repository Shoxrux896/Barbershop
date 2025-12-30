import i2 from "../assets/i2.webp"
import i3 from "../assets/i3.jpg"
import i4 from "../assets/i4.jpg"
import i5 from "../assets/i5.jpg"
import i6 from "../assets/i6.webp"
import i1 from "../assets/i1.jpg"
const Portfolio = () => {

    return (

        <section id="portfolio">
            <h2>Наши работы</h2>
            <div className="portfolio-grid">
                <div className="portfolio-item">
                    <img src={i1} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="portfolio-item">
                    <img src={i2} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="portfolio-item">
                    <img src={i3} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="portfolio-item">
                    <img src={i4} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="portfolio-item">
                    <img src={i5} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="portfolio-item">
                    <img src={i6} alt="" loading="lazy" decoding="async" />
                </div>
            </div>
        </section>
    );
}
export default Portfolio;