const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({

    email: {
    type: String,
    required: true,
    unique: true
  },
  username:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true,
    unique:true
  }
});
console.log('User collection is created')
module.exports=mongoose.model('User',UserSchema) ;          // User is the collection...
