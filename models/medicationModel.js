const mongoose = require("mongoose")

const medicationSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    stock:{
        type: Number,
        required: true,
        default: 0
    },
    stocksold:{
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("medicine", medicationSchema)