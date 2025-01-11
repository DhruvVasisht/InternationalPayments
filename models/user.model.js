import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,  
  },
  userBalance: {
    type: Number,  
    required: true,
    default: 0,  
  },
});

const User = mongoose.model('User', userSchema);

export default User;
