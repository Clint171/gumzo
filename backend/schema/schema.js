const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    picture: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    chats:{

    },
    aiChat:{

    }
});

const User = mongoose.model('User', userSchema);

const chatSchema = new mongoose.Schema({
    users: [{
        type : mongoose.Schema.ObjectId,
        ref : "User"
    }]
});