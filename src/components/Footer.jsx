import insta from "../assets/instagram.svg";
import teleg from "../assets/telegram.svg";

const Footer = () =>{

    return(

    <footer>
      <a href=""><img className="icon" src={insta} alt="" /></a>
      <a href=""><img className="icon" src={teleg} alt="" /></a>
    </footer>
    );
}
export default Footer;