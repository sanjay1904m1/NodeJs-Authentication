const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    
  },
  {
    timestamps: true,
  }
);




//middleware fired before sving the user
// encrypt password before saving it in database
userSchema.pre("save", async function (next) {
  try{
    const salt= await bcrypt.genSalt(10)
    const hashedPassword= await bcrypt.hash(this.password,salt)
    this.password=hashedPassword
    next()
  }catch(error){
    next(error)
  }
});


const User1 = mongoose.model("User1", userSchema);

module.exports = User1;
