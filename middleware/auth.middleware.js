import jwt from "jsonwebtoken"
export const isLoggedIn =async (req,res , next ) => {
    try {
        console.log(req.cookies);
        const token = req.cookies?.token
        console.log("Token found ",token ? "Yes" : "NO ");

        if(!token) {
            console.log("No token");
            return res.status(401).json({
                success:false,
                message:"Authentication failed",
            })
        }
        const getToken = process.env.JWT_SECRETE
        const decodedToken = jwt.verify(token, getToken)
        console.log("decoded data ", decodedToken);
        req.user=decodedToken

        next()
    } catch (error) {
        console.log("Auth middleware failure"+error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
        })
    }
}