import express from "express"
import { registeredUser } from "../controller/user.controller";

const router=express.Router()

router.get("/register",registeredUser)

export default router;