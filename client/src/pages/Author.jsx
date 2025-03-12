import React, { useEffect, useState } from 'react'
import axios from 'axios'
// import Avatar1 from '../assets/avatar1.jpg'
// import Avatar2 from '../assets/avatar2.jpg'
// import Avatar3 from '../assets/avatar3.jpg'
// import Avatar4 from '../assets/avatar4.jpg'
// import Avatar5 from '../assets/avatar5.jpg'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader';

// const authorsData = [
//   {id:1 , avatar:Avatar1, name:'Jhon Doe', posts:3},
//   {id:2 , avatar:Avatar2, name:'Jhon Doe', posts:5},
//   {id:3 , avatar:Avatar3, name:'Jhon Doe', posts:0},
//   {id:4 , avatar:Avatar4, name:'Jhon Doe', posts:2},
//   {id:5 , avatar:Avatar5, name:'Jhon Doe', posts:1}
// ]


const Author = () => {

  const [authors , setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(()=>{
    const getAuthors = async () =>{
      setIsLoading(true);

      try {
        const response = await axios.get(`http://localhost:5000/api/users`);

        setAuthors(response.data);

      } catch (error) {
        console.log(error);
        
      }

        setIsLoading(false);

    }

    getAuthors();
  },[]);

  if (isLoading) {
    return <Loader />
  }



  return (
   <section className='authors'>

    {
      authors.length > 0 ? <div className='container authors_container'>
        {
          authors.map(({_id:id , avatar , name , posts})=>{
            return(
              <>
              <Link key={id} to={`/posts/users/${id}`} className='author'>
          <div className="author_avatar">
            <img src={`http://localhost:5000/uploads/${avatar}`} alt={`Image of ${name}`} />

            </div>    
            <div className="author_info">
              <h4>{name}</h4>
              <p>{posts}</p>
              </div>          
              </Link>
              </>
            )
          })
        }


      </div> : <h2 className='center'>
        No users/authors found
      </h2>
    }

   </section>
  )
}

export default Author