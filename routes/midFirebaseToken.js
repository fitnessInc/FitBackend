//  const { admin } = require('../firebase/firebaseConfig');
const  {admin} = require ( "../firebase/firebaseConfig")



 async function chekFbToken(req, res, next) {

    try {
        const stringToken = req.headers.authorization?.split("Bearer ")[1];
        if (!stringToken) {
            return res.status(401).json({ error: "No token provided" });
        }
        const decodedStringToken = await admin.auth().verifyIdToken(stringToken);
        req.firebaseUser = decodedStringToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }


};

module.exports = chekFbToken;