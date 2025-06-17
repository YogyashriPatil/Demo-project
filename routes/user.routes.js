import express from "express"
import { registeredUser, verifyUser , login, getMe, forgotPassword, resetPassword, logoutUser} from "../controller/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
const router=express.Router()
// registeredUser
router.post("/register", registeredUser)
router.get("/verify/:token",verifyUser)
router.post("/login",login);
router.get("/profile", isLoggedIn, getMe);
router.get("/logout", isLoggedIn, logoutUser);
// router.post("/me", isLoggedIn, resetPassword);


export default router;