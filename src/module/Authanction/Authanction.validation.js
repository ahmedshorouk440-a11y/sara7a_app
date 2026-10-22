
import {z} from 'zod'
export const login = z.strictObject({
    email:z.email(),
    password:z.string().min(8).max(16),

})
export const sinup = login.extend({
 username: z.string(),
 phone:z.e164(),
 ConfirmPassword:z.string().min(8).max(25)
}).superRefine((data , ctx)=>{
    if(data.password != data.ConfirmPassword){
        ctx.addIssue({
            code:"custom",
            path:['ConfirmPassword'],
            message:"password Dismatch with Confirm password"
        })
    }
     if(!data.username.includes(" ")){
        ctx.addIssue({
            code:"custom",
            path:['username'],
            message:"username must contain 2 parts "
        })
    }
})




/*.refine((data)=>{
return data.password == data.ConfirmPassword
},{message : "password Dismatch with Confirm password"})
*/