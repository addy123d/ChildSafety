const mongo = require("mongoose");

const schema = mongo.Schema;

const userSchema = new schema({
    name: {
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Object],
        required: true
    }
})

module.exports = User = mongo.model("myUser", userSchema);