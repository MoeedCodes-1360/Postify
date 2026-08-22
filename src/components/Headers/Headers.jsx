import React from 'react'
import {Container, Logo,Logoutbtn,Button} from "../index"
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import logo from "../../../public/logo.svg"


function Headers() {
  const authStatus= useSelector((state)=>{
   return state.auth.status

  })
  const navigate=useNavigate()
  const navItems=[
   {
      name: 'Home',
      slug: "/",
      active: true
    }, 
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
  },
  {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
  },
  {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
  },
  {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
  },
]
  return (
    <div className='py-3 shadow bg-gray-500'>
      <Container>
        <nav className='flex'>
          <div className='flex flex-row'>
            <Link to="/" >
             <img src={logo} width={45} height={45}   />
            </Link>
             <h1 className='text-3xl font-bold italic font '>Postify</h1>
          </div>
          <ul className='flex ml-auto'>
            {navItems.map((item)=>
            item.active ? (
              <li key={item.name}>
                <Button 
                onClick={()=>navigate(item.slug)

                }
                className="inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full"
                >{item.name}</Button>
              </li>
            ) : null
            )}
            {authStatus && (
              <li className='inline-block px-6 py-2 duration-200 hovering:bg-blue-100 rounded-full'><Logoutbtn /></li>
            )}
          </ul>
        </nav>
      </Container>
    </div>
  )
}

export default Headers
