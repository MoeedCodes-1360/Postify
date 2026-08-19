import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Protected({children,authentication=true}) {
    const navigate=useNavigate()
    const [loader,setLoader]=useState(true)
    const authStatus=useSelector(state=>state.auth.status)
    useEffect(()=>{
        if(authentication && authStatus !==authentication){
            navigate("/")

        }
        else{
            if(!authentication && authStatus!==authentication)
        }
        setLoader(false)
    },[authStatus,authentication,navigate])

  return (
    <div>


      
    </div>
  )
}

export default Protected
