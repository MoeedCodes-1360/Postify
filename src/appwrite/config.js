import conf from "../conf/config";
import  { Client, ID, Databases, Storage, Query} from "appwrite";

export  class Service{

    client=new Client()
    databases;
    bucket;
    constructor(){
         this.client
        .setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectID)
        this.databases=new Databases(this.client)
        this.bucket=new Storage(this.client)
    
    }
    async createPost({title, slug,content,featuredImg,status,userId}){

        try {
            return await this.databases.createDocument({
               databaseId: conf.appwriteDatabaseId,
               collectionId: conf.appwriteCollectionId,
               documentId: slug,
               data:{
                title,
       
                content,
                featuredImg,
                status,
                userId
               },
            })
        } catch (error) {
            console.log("Appwrite Service Err:CreatePost:",error)
            return false
            
        }
    }
    async updatePost(slug,{title,content,featuredImg,status}){
        try {
            return await this.databases.updateDocument({
                 databaseId: conf.appwriteDatabaseId,
               collectionId: conf.appwriteCollectionId,
               documentId: slug,
               data:{
                title,
       
                content,
                featuredImg,
                status,
                
               }
            })
            
        } catch (error) {
            console.log("service error(updateDoc): ",error)
            
        }

    }
    async deletePost(slug){
        try {

           await this.databases.deleteDocument({
             databaseId: conf.appwriteDatabaseId,
               collectionId: conf.appwriteCollectionId,
               documentId: slug,
               

           })

           return true;
        }
        catch (error) {

             console.log("Appwrite Service Error(delete):",error)
            return false

            
        }



    }
    async getPost(slug){
        try {
            return await this.databases.getDocument({

                databaseId: conf.appwriteDatabaseId,
                collectionId: conf.appwriteCollectionId,
                documentId: slug,
            })

            
        } catch (error) {
            console.log("Service Error:getPost:",error);
            return false
            
            
        }
    }
    async getPosts(queries=[Query.equal("status","active")]){
        try {
            return await this.databases.listDocuments({
                databaseId: conf.appwriteDatabaseId,
               collectionId: conf.appwriteCollectionId,
               queries,
               

            })
            
        } catch (error) {
            console.log("Appwrite Service error(posts)",error);
            return false
            
        }

    }
    async uploadFile(file){
        try {
            return await this.bucket.createFile({
                bucketId:conf.appwriteBucketId,
                fileId:ID.unique(),
                file:file
            })
            
        } catch (error) {
            console.log("Service error (uploadFiles): ",error," fu");
            return false
            
            
        }
    }
    async deleteFile(fileid){
        try {
            await this.bucket.deleteFile(
{                bucketId:conf.appwriteBucketId,
                    fileId: fileid,
}

            )

            return true
        } catch (error) {
            console.log("Service Error (delete file",error);
            return false
            
            
        }
    }
    getFilePreview(fileid){
        return this.bucket.getFilePreview({
             bucketId:conf.appwriteBucketId,
                    fileId: fileid,
        })
    }
}
const service=new Service()

export default service