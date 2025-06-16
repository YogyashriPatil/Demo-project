import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./util/db.js"
import cookieParser from "cookie-parser"
//default route a raha tha esaliye khucch bhi name dale so userRoutes
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
));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
//access the cookies
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/yogyashri',(req,res)=>{
    res.send("Yogyashri is here")
});
//connect to db
//database is always in another continent 
db();
app.use("/api/v1/users",userRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})