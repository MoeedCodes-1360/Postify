import React from 'react'
import {Container, Logo,Logoutbtn} from "../index"
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Headers() {
  const authStatus= useSelector((state)=>{
    state.auth.status

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
          <div>
            <Link to="/" />
            <Logo width="70px" />
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
              <li className='inline-block px-6 py-2 duration-200 hovering:bg-blue-100 rounded-full'>Logout</li>
            )}
          </ul>
        </nav>
      </Container>
    </div>
  )
}

export default Headers
