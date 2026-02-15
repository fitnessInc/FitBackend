 const admin  = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket:'sporty-6fdac.appspot.com',
    projectId: serviceAccount.project_id


});



const db = admin.firestore() 
const bucket = admin.storage().bucket();

module.exports = {admin,db,bucket}