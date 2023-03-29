const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

userSchema.statics.findOrCreate = async function (profile) {
  const user = await User.findOne({ googleId: profile.sub }, 3000);

  if (user) {
    return user;
  }

  return this.create({
    googleId: profile.sub,
    displayName: profile.name,
    email: profile.email
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
