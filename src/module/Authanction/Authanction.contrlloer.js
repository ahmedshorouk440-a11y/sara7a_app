
import { Router } from "express";
import { filevalidation, localFileUpload } from "../../common/utlities/multer/multer.js";
import { AddAuth, DeleteAuth, GetAllUser, GetUserById, login, UpdateUser } from "./Authanction.service.js";
import { auth } from "../../common/middleWare/token.middle.js";
import * as validators from './Authanction.validation.js'

import { Validation } from "../../common/middleWare/Validation/index.js";
import { BadRequestExcption } from "../../common/Exption/index.js";
const router = Router()


router.post(
  "/SignUp",
  localFileUpload({ validation: filevalidation.image }).single("image"),
  Validation(validators.sinup),
  async (req, res, next) => {
    try {
      const data = { ...req.body };
      if (req.file) data.picture = req.file.path;

      const user = await AddAuth(data);

      res.status(201).json({
        message: "Auth Added Successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);
router.get("/GetAllAuth" , async(req, res, next)=>{
    try{
    let data = await GetAllUser(req.query)
    res.status(202).json({
        message: "User Fetched" , 
        data
    })
    }catch(error){
        next(error)
    }
})

router.patch("/Confirm_Email", async (req, res, next) => {
  try {
    let data = await ConfirmEmail(req.body);
    res.status(200).json({
      message: "Email Confired",
      data,
    });
  } catch(error) {
    next(error);
  }
});  

router.post("/Login", Validation(validators.login), async (req, res, next) => {
  try {
    const data = await login(req.validate)
    res.status(200).json({
      message: "User Login Successfully",
      data,
    })
  } catch (error) {
    next(error)
  }
})

router.get("/GetUserById" , auth , async(req,  res , next)=>{
    try{



        let data = await GetUserById(req.user.id)
        res.status(200).json({
            message : "User Fetched",
            data
        })
    }catch(error){
    next(error)

    }
})

router.patch("/UpdateAuth" , auth,async(req, res, next)=>{
try{
    let data = await UpdateUser(req.user.id , req.body)
    res.status(201).json({
        message : "User Updated Successfully",
        data
    })
}catch(error){
  next(error)
}
})
router.delete("/deleteAuth" , auth , async(req, res, next)=>{
    try{
     let data = await DeleteAuth(req.user.id)
     res.status(201).json({
        message : "User Deleted Successfully",
        data
     })
    }catch(error){
        next(error)
    }
})


export default router