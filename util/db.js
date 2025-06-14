import mongoose from "mongoose"

//export a function that connect to db

const db = () => {
    mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to mongodb")
    })
    .catch((err) => {
        console.log("Error in connecting to mongodb"+err)
    })
};
export default db;