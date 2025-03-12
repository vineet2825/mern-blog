import { Link } from 'react-router-dom';
import logo from '../assets/logo1.png';
import { MdMenu } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useContext} from 'react';
import { UserContext } from '../context/useContext';



const Header = () => {

  const {currentUser} = useContext(UserContext);


  return (
    <nav>
      <div className="container nav_container">
          <Link to={'/'} className='nav_logo'>
          <img src={logo} alt="" />
          </Link>
        
      { currentUser?.id && <ul className='nav_menu'>
          <li><Link to={`/profile/${currentUser.id}`}>{currentUser?.name}</Link></li>
          <li><Link to={'/create'}>Create Post</Link></li>
          <li><Link to={'/authors'}>Authors</Link></li>
          <li><Link to={'/logout'}>Logout</Link></li>
        </ul>}
      {!currentUser?.id &&  <ul className='nav_menu'>
          
          <li><Link to={'/authors'}>Authors</Link></li>
          <li><Link to={'/login'}>Login</Link></li>
        </ul>}

        <button className='nav_toggle-btn'>
          <IoClose />
        </button>
      
      </div>

     
    </nav>
  )
}

export default Header