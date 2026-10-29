
import { AuthModel } from "../../modle/Authanction.model.js";
import { compare, hash } from "../../common/Hash/index.js";
import jwt from "jsonwebtoken";
import { BadRequestExcption, NotFoundExcption, UnauthroziedExption } from "../../common/Exption/index.js";

import { emailEvent } from "../../common/utlities/Email/index.js";
import { EmailSubjectEnum } from "../../common/utlities/Email/Enum/email.enum.js";
import { CreateOtp } from "../../common/utlities/Email/otp.js";

export const otpKey = (email) =>
  `User :: ${email} :: ${EmailSubjectEnum.CONFIRM_EMAIL} :: OTP`;


const MAX_ATTEMPTS = 5;
const BAN_MS = 5 * 60 * 1000; 
const OTP_MS = 5 * 60 * 1000;


const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.USER_SIGNATURE, {
    audience: "user",
    expiresIn: "1h",
  });


const sendOtp = async ({ userId, email, subject, field, expiresField }) => {
  const code = CreateOtp();
  await AuthModel.updateOne(
    { _id: userId },
    {
      $set: {
        [field]: await hash(String(code)),
        [expiresField]: new Date(Date.now() + OTP_MS),
      },
    }
  );
  emailEvent.emit("sendEmail", {
    recipients: { to: email },
    subject,
    data: { code },
  });
};


export const AddAuth = async (body) => {
  try {
    let { username, email, password, ConfirmPassword, age, Address, picture } = body;

    let data = await AuthModel.create({
      username,
      email,
      password: await hash(password),
      ConfirmPassword,
      age,
      Address,
      picture,
    });

    await sendOtp({
      userId: data._id,
      email,
      subject: EmailSubjectEnum.CONFIRM_EMAIL,
      field: "emailOtp",
      expiresField: "emailOtpExpires",
    });

    return data;
  } catch (error) {
    throw error;
  }
};


export const GetAllUser = async (quary) => {
  try {
    let page = Number(quary.page);
    let limit = Number(quary.limit);

    if (!page || page < 1) page = 1;
    if (!limit || limit < 1) limit = 2;

    let skip = (page - 1) * limit;
    let data = await AuthModel.find({}).limit(limit).skip(skip);
    let total = await AuthModel.countDocuments();
    return {
      data,
      skip,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};


export const ConfirmEmail = async ({ otp, email }) => {
  const data = await AuthModel.findOne({
    email,
    confirmEmail: { $exists: false },
  });
  if (!data) throw NotFoundExcption("Invalid account");

  if (!data.emailOtp || data.emailOtpExpires < Date.now()) {
    throw BadRequestExcption("OTP expired or not requested");
  }
  if (!(await compare(String(otp), data.emailOtp))) {
    throw BadRequestExcption("Invalid Otp");
  }

  data.confirmEmail = new Date();
  data.emailOtp = undefined;
  data.emailOtpExpires = undefined;
  await data.save();

  return data;
};


export const login = async ({ email, password }) => {
  try {
    const user = await AuthModel.findOne({ email });
    if (!user) throw NotFoundExcption("User Email Not Found");

    
    if (user.banUntil && user.banUntil > Date.now()) {
      const mins = Math.ceil((user.banUntil - Date.now()) / 60000);
      throw UnauthroziedExption(
        `Account temporarily banned. Try again after ${mins} minute(s)`
      );
    }

   
    const match = await compare(password, user.password);

    if (!match) {
      
      const attempts = user.failedLoginAttempts + 1;

      if (attempts >= MAX_ATTEMPTS) {
        await AuthModel.updateOne(
          { _id: user._id },
          {
            $set: {
              failedLoginAttempts: 0,
              banUntil: new Date(Date.now() + BAN_MS),
            },
          }
        );
        throw UnauthroziedExption(
          "Too many failed attempts. Account banned for 5 minutes"
        );
      }

      await AuthModel.updateOne(
        { _id: user._id },
        { $set: { failedLoginAttempts: attempts } }
      );
      throw UnauthroziedExption("invailed User Or Password");
    }

    
    await AuthModel.updateOne(
      { _id: user._id },
      { $set: { failedLoginAttempts: 0 }, $unset: { banUntil: "" } }
    );

    
    if (user.twoStepEnabled) {
      await sendOtp({
        userId: user._id,
        email: user.email,
        subject: EmailSubjectEnum.LOGIN_CONFIRMATION,
        field: "loginOtp",
        expiresField: "loginOtpExpires",
      });
      return {
        message: "OTP sent to your email, confirm login to get your token",
        twoStepRequired: true,
      };
    }

    
    return { message: "Login Successfully", token: signToken(user._id) };
  } catch (error) {
    throw error;
  }
};


export const confirmLogin = async ({ email, otp }) => {
  const user = await AuthModel.findOne({ email });
  if (!user || !user.loginOtp || user.loginOtpExpires < Date.now()) {
    throw BadRequestExcption("OTP expired or not requested");
  }
  if (!(await compare(String(otp), user.loginOtp))) {
    throw BadRequestExcption("Invalid Otp");
  }

  await AuthModel.updateOne(
    { _id: user._id },
    { $unset: { loginOtp: "", loginOtpExpires: "" } }
  );

  return { message: "Login Successfully", token: signToken(user._id) };
};


export const enableTwoStep = async (userId) => {
  const user = await AuthModel.findById(userId);
  if (!user) throw NotFoundExcption("User not found");
  if (user.twoStepEnabled) {
    throw BadRequestExcption("2-step verification already enabled");
  }

  await sendOtp({
    userId: user._id,
    email: user.email,
    subject: EmailSubjectEnum.TWO_STEP_VERIFICATION,
    field: "twoStepOtp",
    expiresField: "twoStepOtpExpires",
  });

  return { message: "OTP sent to your email" };
};


export const confirmEnableTwoStep = async (userId, otp) => {
  const user = await AuthModel.findById(userId);
  if (!user || !user.twoStepOtp || user.twoStepOtpExpires < Date.now()) {
    throw BadRequestExcption("OTP expired or not requested");
  }
  if (!(await compare(String(otp), user.twoStepOtp))) {
    throw BadRequestExcption("Invalid Otp");
  }

  await AuthModel.updateOne(
    { _id: userId },
    {
      $set: { twoStepEnabled: true },
      $unset: { twoStepOtp: "", twoStepOtpExpires: "" },
    }
  );

  return { message: "2-step verification enabled" };
};


export const GetUserById = async (Id) => {
  try {
    let data = await AuthModel.findById(Id);
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateUser = async (Id, body) => {
  try {
    let { FullName, email, password, age, Address, picture } = body;

    const update = { FullName, email, age, Address, picture };
    if (password) update.password = await hash(password);

    
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    let data = await AuthModel.findByIdAndUpdate(
      Id,
      { $set: update },
      { new: true, runValidators: true }
    );
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteAuth = async (Id) => {
  try {
    return await AuthModel.findOneAndDelete({ _id: Id });
  } catch (error) {
    throw error;
  }
};