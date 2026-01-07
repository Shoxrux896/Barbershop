import { Suspense, lazy } from "react";

const BookingForm = lazy(() => import("./components/BookingForm"));
import Header from "./components/Header";
import Hero from "./components/Hero";
const Portfolio = lazy(() => import("./components/Portfolio"));

const Service = lazy(() => import("./components/Service"));
import ModalContact from "./components/ModalContact";
import Footer from "./components/Footer";
const Admin = lazy(() => import("./components/Admin"));
  


function App() {

  return (
    <Suspense fallback={<div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#0f1011',
      color: '#c5a059',
      fontSize: '1.5rem',
      fontFamily: 'sans-serif',
      textTransform: 'uppercase'
    }}>Загрузка...</div>}>
      {window.location.pathname === '/admin' ? (
        <Admin />
      ) : (
        <>
          <Header />
          <Hero />
          <Service />
  <Portfolio />
          <BookingForm />
          <ModalContact />
         
          <Footer />
         
        </>
      )}
    </Suspense>
  )
}

export default App;
