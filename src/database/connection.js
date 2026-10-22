
import mongoose from "mongoose";


export async function main() {
  try {
    mongoose.connect(process.env.DATABASE_URI).then(()=>{
      
      console.log("Data Base Connected");
    })
  } catch (error) {
    console.log(error);
    throw error;
  }
}

