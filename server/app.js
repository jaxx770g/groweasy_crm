import express from "express"
import cors from "cors"
import { router } from "./routes/user.routes.js";
const app=express();
app.use(cors({
    origin:process.env.frontend || 'http://localhost:3000',
    methods:['GET','POST'],
    allowedHeaders:['Content-Type','Authorization'],
credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}))
     
app.use("/api/v1/csvimpoter",router);
export default app
