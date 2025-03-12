import React, {useContext , useEffect , useState} from 'react'
import PostAuther from '../components/PostAuther';
import { Link, useParams } from 'react-router-dom'
import Loader from '../components/Loader';
import DeletePost from './DeletePost';
import { UserContext } from '../context/useContext';
import axios from 'axios';

  

const PostDetail = () => {


  const {id} = useParams();
  const [post , setPost] = useState(null);
  
  const [error , setError] = useState(null);
  const [isLoading , setIsLoading] = useState(false);

  const {currentUser} = useContext(UserContext);

  useEffect(()=>{
    const getPost = async () =>{
      setIsLoading(true);

      try {
        const response =  await axios.get(`http://localhost:5000/api/posts/${id}`);

        setPost(response.data);
     

      } catch (error) {
       setError(error) 
      }

      setIsLoading(false)
    }

    getPost();
  },[])



  if(isLoading){
    return <Loader />
  }

  return (
    <>
    <section className="post-detail">

      {error && <p className='error'>{error}</p>}

   {post && <div className="container post-detail_container">

    <div className="post-detail_header">

    <PostAuther  authorID={post.creator} createdAt={post.createdAt}/>
    
   {currentUser?.id == post?.creator && <div className="post-detail_buttons">
      <Link to={`/posts/${post?._id}/edit`} className='btn sm primary'>Edit</Link>
      {/* <Link to={'/posts/werwer/delete'} className='btn sm primary'>Delete</Link> */}
      <DeletePost postId={id} />
    </div>}

    </div>

    <h1>{post.title}</h1>

    <div className="post-detail_tumbnail">
      <img src={`http://localhost:5000/uploads/${post.thumbnail}`} alt="" />
    </div>

<p dangerouslySetInnerHTML= {{__html: post.description}}></p>
    </div>}

    </section>
    </>
  )
}

export default PostDetail