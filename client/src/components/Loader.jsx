import React from 'react'
import Lottie from 'lottie-react' // npm i lottie-react
import Infinite from '../loading.json';

const Loader = () => {
  return (
    <>

    <div style={{height:"100vh", display:"flex", justifyContent:"center", alignItems:"center"}}>
    <Lottie animationData={Infinite} style={{width:"400px"}} />
    </div>
    </>
  )
}

export default Loader