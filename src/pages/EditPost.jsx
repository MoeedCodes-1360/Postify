import React,{useEffect,useState} from 'react'
import { Container,PostCard,PostForm } from '../components'
import appwriteService from '../appwrite/config'
import { useNavigate, useParams } from 'react-router-dom'

function EditPost() {
    const [post,setPost]=useState(null)
    const {slug}=useParams()
    const navigate = useNavigate()
    useEffect(()=>{
        if(slug){
            appwriteService.getPosts(slug).then((post)=>{
                if(post){
                    
                    setPost(post)
                }
                
            })
        }
        else{
            navigate("/")
        }
    },[slug,navigate])
  return post?(
    <div className='py-8'>
  <Container>
    <PostCard post={post}/>
  </Container>
    </div>
  ):null
}

export default EditPost
