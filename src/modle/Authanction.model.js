
import mongoose from "mongoose";


const AuthScema = mongoose.Schema({
    FullName:{
        type:String,
        
    },
    email:{
        type:String,
        unique:true,
        required:true
    },password:{
       type:String
    },
    age:Number,
    Address:String,

    role:{
        type:String,
        enum:["user" , "admin"],
        default:"user"
    },
    ConfirmPassword:{
        type: String
    }
})
export const AuthModel = mongoose.model('Authanction' , AuthScema)
