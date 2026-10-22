import { AuthModel } from "../../modle/Authanction.model.js";
import { compare, hash } from "../../common/Hash/index.js";
import jwt from 'jsonwebtoken'
import { BadRequestExcption, NotFoundExcption, UnauthroziedExption } from "../../common/Exption/index.js";

import { emailEvent } from "../../common/utlities/Email/index.js";
import { EmailSubjectEnum } from "../../common/utlities/Email/Enum/email.enum.js";
import { CreateOtp } from "../../common/utlities/Email/otp.js";

export const otpKey = (email) =>
  `User :: ${email} :: ${EmailSubjectEnum.CONFIRM_EMAIL} :: OTP`;

export const AddAuth = async (body) => {
  try {
    let {username , email, password ,ConfirmPassword , age, Address, picture  } = body;

    let data = await AuthModel.create({
     username,
      email,
      password: await hash(password),
       ConfirmPassword,
      age,
      Address,
      picture,
    });
      emailEvent.emit("sendEmail" , {recipients:{to:email} ,
          subject:EmailSubjectEnum.CONFIRM_EMAIL , data:{code:CreateOtp()}  }) 
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetAllUser = async (quary) => {
  try {
    let page = Number(quary.page);
    let limit = Number(quary.limit);


    if(!page || page <1) page = 1
    if(!limit || limit <1) limit = 2

    let skip = (page - 1) * limit;
    let data = await AuthModel.find({ }).limit(limit).skip(skip);
    let total = await AuthModel.countDocuments();
    return {
      data,
      skip,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw error;
  }
};

export const ConfirmEmail = async ({ otp, email }) => {
  const data = await AuthModel.findOne({
    email,
    provider: ProviderEnum.SYSTEM,
    confirmEmail: { $exists: false },
  });
  if (!data) throw NotFoundExcption("Invalid account");

  const hashOtp = await get({ key: otpKey(email) });
  if (!hashOtp || !(await compare(String(otp), hashOtp))) {
    throw  BadRequestExcption("Invalid Otp");
  }

  data.confirmEmail = new Date();
  await data.save();
  await del({ key: otpKey(email) });

  return data;
};

export const login=async(data)=>{
  try{
    let {email, password} = data
    let user = await AuthModel.findOne({email})
    if(!user){
      throw NotFoundExcption("User Email Not Found")
    }
    let match = await compare(password, user.password)

    if(!match){
      throw UnauthroziedExption("invailed User Or Password")
    }
    let token = jwt.sign({id:user._id },process.env.USER_SIGNATURE, { audience: "user", expiresIn: "1h" }       )
      return {message : "Login Successfully" , token}

  }catch(error){
    throw error
  }
}

export const GetUserById=async(Id)=>{
try{

  let data = await AuthModel.findById(Id)
  return data
}catch(error){
 throw error
}
}

export const UpdateUser=async(Id , body)=>{
  try{
    
let { FullName, email, password, age, Address, picture } = body;
    let data = await AuthModel.findByIdAndUpdate( Id ,{ $set: { FullName, email, password, age, Address, picture } },
      { new: true, runValidators: true }
 )
    return data
  }catch(error){
   throw error
  }

}
export const DeleteAuth=async(Id)=>{
  try{
   return await AuthModel.findOneAndDelete({ _id: Id })
   return data

  }catch(error){
    throw error
  }
}
