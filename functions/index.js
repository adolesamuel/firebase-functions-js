/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


exports.randomNumber =  onRequest((request,response) => {

    const number = Math.round(Math.random() * 100);
    console.log(number);

    response.send(number.toString());
},);

exports.toTheDoJo =  onRequest((request,response) => {

    response.redirect("https://www.thenetninja.co.uk");
},);

// http callable function
exports.sayHello = onCall((data,context) => { 
    const name = data.name;
    return `hello, ninjas ${name}`;
},);

exports.newUserSignUp = functions.auth.user().onCreate(user =>{
    console.log('user created',user.email,user.uid);
});


exports.userDeleted = functions.auth.user().onDelete(user =>{
    console.log('user deleted',user.email,user.uid);
});