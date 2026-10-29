
import mongoose from "mongoose";

const AuthScema = mongoose.Schema({
    FullName: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String
    },
    ConfirmPassword: {
        type: String
    },
    age: Number,
    Address: String,
    picture: String,

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    
    provider: {
        type: String,
        default: "system"
    },
    confirmEmail: Date,

   
    failedLoginAttempts: { type: Number, default: 0 },
    banUntil: Date,

    
    twoStepEnabled: { type: Boolean, default: false },
    twoStepOtp: String,
    twoStepOtpExpires: Date,
    loginOtp: String,
    loginOtpExpires: Date,
});

export const AuthModel = mongoose.model('Authanction', AuthScema);