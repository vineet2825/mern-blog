import React from 'react'
import BlogLottie from '../blog.json'
import Lottie from 'lottie-react'
import imgPic from '../assets/logo.png'

const Hero = () => {
  return (
   <>
   <div className="hero">
     <div className="home container" id="home">
        <section className="flex">
<div className="contnet">
    <h3><span>Create </span> a blog</h3>
    <p>Share your story with the world. Create a beautiful, personalized blog that fits your brand.</p>
    <a href="#" className="">Explore now</a>
</div>

<div className="image">
    {/* <Lottie animationData={BlogLottie}  style={{width:"500px"}}/> */}
    <img src={imgPic} alt="" />
</div>

           
        </section>
    </div>
    </div>
   </>
  )
}

export default Hero