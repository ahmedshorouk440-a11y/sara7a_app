
import 'dotenv/config';
import express from "express";

import './database/connection.js'
import { main } from "./database/connection.js";
import AuthRouter from './module/Authanction/Authanction.contrlloer.js'
import { handler } from './common/middleWare/GlobalError/index.js';




const app = express()
app.use(express.json())
app.use('/uploads' , express.static('uploads'))
app.use(AuthRouter)

main()

app.use(handler)
 


app.listen(process.env.PORT , ()=>{
console.log(`server is running on port ${process.env.PORT}`)
})