var mongoose = require('mongoose');


var TokenSchema = new mongoose.Schema({
    //username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    email: {type: String, unique: [true, "Email is in use!"], required: [true, "Email can't be blank!"], match: [/\S+@\S+\.\S+/, 'Email is invalid!'], index: true},
    name: {type: String, required:[true, "Name can't be black"]},
    //image: String,
    //favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    //following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hash: String,
    salt: String,

    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {timestamps: true});


mongoose.model('Token', TokenSchema);