import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./util/db.js"
 
import userRoutes from "./routes/user.routes.js"
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors(
    {
        origin:process.env.BASE_URL,
        methods:['GET','POST','DELETE','OPTIONS'],
        allowedHeaders:['Content-Type','Authorization'],
        credentials:true
    }
))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/yogyashri',(req,res)=>{
    res.send("Yogyashri is here")
})
//connect to db
db()

app.use("/api/v1/user/",userRoutes)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})