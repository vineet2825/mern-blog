import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';

import {UserContext} from '../context/useContext';

const Login = () => {

  const [userData, setUserData] = useState({
 
    email:'',
    password:'',
 
  });



  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {setCurrentUser} = useContext(UserContext);

  const changeInputHandler = (e) =>{

    setUserData(prevState => {

      return {...prevState, [e.target.name]: e.target.value}

    });

  }


  const loginUser =  async (e) =>{
        e.preventDefault();
        setError('')

        try {
          
          const response = await axios.post('http://localhost:5000/api/users/login', userData);
          const user = await response.data;
          setCurrentUser(user)
          navigate('/')

        } catch (err) {
          setError(err.response.data.message)
        }
  }

  return (
    <section className='login'  >
        <div className="container">
          <h2>Login</h2>
          <form action="" className='form register_login' onSubmit={loginUser}>
            {error && <p className='form_error-message'>{error}</p>}
           
            <input type="email" name='email'  placeholder='Email' value={userData.email} onChange={changeInputHandler}/>
            <input type="password" name='password'  placeholder='password' value={userData.password} onChange={changeInputHandler}/>
            <button type='submit' className='btn primary'>Login</button>
          </form>

          <small>don't have an account? <Link to={'/register'}>register</Link></small>
        </div>

    </section>
  )
}

export default Login