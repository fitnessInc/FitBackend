 const User = require('../schemas/usersSchema');

 const checkCurrentUser =async (req,res,next)=>{

    try{
        const user = await User.findOne({firebaseUid:req.firebaseUser.uid});
        if(!user) return res.status(404).json({success:false, message:'userUid is not in the db '});
             req.currentUser = user;
             next();
    }catch(e){
         console.log(e)
         res.status(500).json({sucessfalse, mesage:" error server"})
    }

      
    
 }

 module.exports= checkCurrentUser

 