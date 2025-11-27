import { useState } from 'react'

const Header = () =>{
    const [open, setOpen] = useState(false)

     const handleScrollToSection = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  
  };
    return(
        <header>
        <nav className={open ? 'nav nav--open' : 'nav'}>
            <div className="logo">💈 ELITE BARBER</div>

            <button
                className={"nav-toggle" + (open ? ' open' : '')}
                aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
                aria-expanded={open}
                onClick={()=>setOpen(v=>!v)}
            >
                <span className="bar" />
                <span className="bar" />
                <span className="bar" />
            </button>

            <ul onClick={()=>setOpen(false)}>
                <li><a href="#home" onClick={(e) => handleScrollToSection(e,'home')}>Главная</a></li>
                <li><a href="#services" onClick={(e) => handleScrollToSection(e,'services')}>Услуги</a></li>
                <li><a href="#portfolio" onClick={(e) => handleScrollToSection(e,'portfolio')}>Работы</a></li>
            
                <li><a href="#booking" onClick={(e) => handleScrollToSection(e,'booking')}>Запись</a></li>
                <li><a href="#contact" onClick={(e) => handleScrollToSection(e,'contact')}>Контакты</a></li>
            </ul>
        </nav>
    </header>
    );
}
export default Header;