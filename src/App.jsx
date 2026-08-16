
import { useEffect, useState } from 'react'
import './App.css'
import { useDispatch } from 'react-redux'
import authService from "./appwrite/auth"
import { login,logout } from './store/authSlice'
import { Footer,Headers} from "./components"
import { Outlet } from 'react-router-dom'

function App() {
  // const [count, setCount] = useState(0)
  const [loading,setLoading]=useState(true)
  const dispatch= useDispatch()

  useEffect(()=>{
    authService.getCurrentUser()
    .then((userData)=>{
      if (userData){
        dispatch(login({userData}));
       
      }
      else{
        dispatch(logout({}))
      }


    })
    .finally(()=>{
      setLoading(false)
    })

  },[])

  return !loading ? (
    

    <div className='min-h-screen flex flex-wrap  justify-center content-between bg-gray-500'>
    
    <div className=" block">

      <Headers />

    <main>
     Todo: <Outlet />
    </main>
      <Footer />
    </div>
    </div>
  ) : null
}

export default App
