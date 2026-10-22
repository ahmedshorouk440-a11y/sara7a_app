
import bcrypt from 'bcrypt'



export const hash = async (plainText, saltRounds = Number(process.env.SALT) || 10) => {
  return await bcrypt.hash(plainText, saltRounds);
};


export const compare =async(plainText , hashText)=>{
    const CipherText = await bcrypt.compare(plainText , hashText)
    return CipherText

}