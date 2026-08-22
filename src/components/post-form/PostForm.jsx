import React, {useCallback} from 'react'
import {useForm} from "react-hook-form"
import {Input,Logo,Button,Select,RTE} from "../index"
import appWriteService from "../../appwrite/config"
import {useNavigate} from "react-router-dom"
import { useSelector } from 'react-redux'

const PostForm = ({post }) => {
    const {register,handleSubmit,watch,setValue,control,getValues}=useForm({
        defaultValues:{
            title: post?.title || '',
            slug:post?.$id || "",
            content:post?.content || '',
            status:post?.status || 'active',

        }
    })
    const navigate=useNavigate()
    const userData=useSelector(state=>state.auth.userdata)
    const submit=async (data)=>{
        
        if(post){
           const file=  data.image[0] ? await appWriteService.uploadFile(data)   : null
           console.log("Post:", file)
console.log("FeaturedImage:", file?.FeaturedImage)
            if(file){
                appWriteService.deleteFile(post.featuredImg)
            }
            const dbPost=appWriteService.updatePost(post.$id,{
                ...data,
                featuredImg:file ? file.$id : post.featuredImage,
                
                
            })
            if(dbPost){
                    navigate(`/post/${dbPost.$id}`)

                }
        }
        else{
            const file=await appWriteService.uploadFile(data.image[0])
            
            if (file){
                const fileId=file.$id
                data.featuredImg=fileId
                
                // console.log("redux User:", userData?.$id)
                // console.log("redux User:", userData)
                // console.log(userData.userData.$id);
                
                
              const dbPost=  await appWriteService.createPost({...data,
                    userid:userData.userData.$id
                    
                })
                if(dbPost){
                    navigate(`/post/${dbPost.$id}`)
                }
            }

        }
    }
    const slugTransform= useCallback((value)=>{
        if (value && typeof value==='string') {
            return value.trim()
            .toLowerCase()
            .replace(/^[a-zA-Z\d\s]+/g,'-')
            .replace(/\s/g,'-')
        }  
    return ''  },[])
           
        React.useEffect(()=>{
                const subscription=watch((value,{name})=>{
                    if (name==='title'){
                        setValue('slug',slugTransform(value.title,{shouldValidate:true}))
                    }
                })
                    return ()=>{
                        subscription.unsubscribe()
                    }
                
        },[watch,slugTransform,setValue])
  return (
     <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
  )
}

export default PostForm
