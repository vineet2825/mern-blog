import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate , useParams } from "react-router-dom";
import {DUMMY_POST} from '../data'
import { UserContext } from "../context/useContext";
import axios from 'axios';
import Loader from '../components/Loader';
import DeletePost from "./DeletePost";

const Dashboard = () => {
  

  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading , setIsLoading] = useState(false);
  const {id} = useParams()

  const {currentUser} = useContext(UserContext);
  const token = currentUser?.token;
  
  // redirect to login page for any user who isn't logged in
  
  useEffect(()=>{
    if(!token){
      navigate('/login')
    }
  }, []);

  useEffect(()=>{
    const fetchPosts = async () =>{
      setIsLoading(true);

      try {
        const response = await axios.get(`http://localhost:5000/api/posts/users/${id}`,{ withCredentials: true, headers: { Authorization: `Bearer ${token}` } })

        setPosts(response.data)
      } catch (error) {
        console.log(error);
        
      }
        setIsLoading(false)

    }

    fetchPosts();
  },[id]);

  if(isLoading){
    return <Loader />
  }



  return (
    <>
      <section className="dashboard">
        {posts.length ? (
          <div className="container dashboard_container">

            {
              posts.map((post => {
                return <article key={post.id} className="dashboard_post">
                  <div className="dashboard_post-info">
                  <div className="dashborad_post-thumbnail">
                  <img src={`http://localhost:5000/uploads/${post.thumbnail}`} alt="" />
                  </div>
                  <h5>{post.title}</h5>
                  </div>
                  <div className="dashboard_post-actions">
                    <Link to={`/posts/${post._id}`} className="btn ">
                    View</Link>
                    <Link to={`/posts/${post._id}/edit`} className="btn sm primary">
                    Edit</Link>
                   <DeletePost postId={post._id} />
                  </div>
                </article>
              }))
            }
          </div>
        ) : (
          <div className="center">You have no posts yet.</div>
        )}
      </section>
    </>
  );
};

export default Dashboard;
