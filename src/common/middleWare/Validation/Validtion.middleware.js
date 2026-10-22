import { BadRequestExcption } from "../../Exption/index.js"

export const Validation=(schema)=>{
    return (req,res,next)=>{
         const validationResult=schema.safeParse(req.body)
         if(!validationResult.success){
            throw BadRequestExcption("validtion Error" , validationResult.error.issues)
         }
         req.validate = validationResult.data
         next()
    }
}