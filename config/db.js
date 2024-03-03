const mongoose = require("mongoose")

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)

        console.log(`MongoDB connected`)
    }catch(err){
        console.log(`Error: ${err.message}`.red.bol)  
        process.exit()
    }
}

module.exports = connectDB