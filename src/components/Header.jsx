import { useState } from 'react';
import logo from '../assets/logo.png';

const Header = () => {
  const [open, setOpen] = useState(false);

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Главная' },
    { id: 'services', label: 'Услуги' },
    { id: 'portfolio', label: 'Работы' },
    { id: 'booking', label: 'Запись' },
    { id: 'contact', label: 'Контакты' },
  ];

  return (
    <header>
      <nav className={open ? 'nav nav--open' : 'nav'}>

        <div className="logo">
          <img src={logo} alt="logo" loading="eager" decoding="async" />
        </div>

        <button
          className={`nav-toggle ${open ? 'open' : ''}`}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleScrollToSection(e, item.id)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

      </nav>
    </header>
  );
};

export default Header;
