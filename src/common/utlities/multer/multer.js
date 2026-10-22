
import multer from "multer";
import fs from 'fs'
export const filevalidation={
    image:['image/jpeg' , 'image/png' , 'image/gif']

}
export const localFileUpload = ({validation = [] } = {})=>{
    fs.mkdirSync('./uploads' , {recursive : true})
     const storage = multer.diskStorage({
        destination:'./uploads',
        filename:(req, file, cb)=>{
            cb(null , `${Date.now}-${file.originalname}`)
        }
     })
     const limits ={
        fileSize: 2*1024*1024
     }
     const fileFilter = (req, file, cb)=>{
        if(validation.includes(file.mimetype)){
             cb(null , true)
        }else{
            cb(new Error('Invalid format') ,false)
        }
     }
     return multer({storage , limits , fileFilter})
}

