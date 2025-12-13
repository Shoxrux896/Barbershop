
import BookingForm from "./components/BookingForm";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Portfolio from "./components/Portfolio";

import Service from "./components/Service";
import ModalContact from "./components/ModalContact";
import Footer from "./components/Footer";
import Admin from "./components/Admin";
import ModalPage from "./components/ModalPage";


function App() {
  

  return (
    <>
    {window.location.pathname === '/admin' ? (
      <Admin />
    ) : (
     <>
     <Header/>
     <Hero/>
     <Portfolio/>
     <Service/>

     <BookingForm/>
     <ModalContact/>
     <Footer/>
     <ModalPage/>
     </>
    )}
    </>
  )
}

export default App;
