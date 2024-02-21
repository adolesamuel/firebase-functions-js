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
const admin = require("firebase-admin");

admin.initializeApp();

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

  return  admin.firestore().collection('users').doc(user.uid).set({
        'email':user.email,
        'upvotedOn':[],
    },)


});


exports.userDeleted = functions.auth.user().onDelete(user =>{

    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

exports.addRequests = onCall((data,context) => {
    if(!context.auth){
        throw new functions.https.HttpsError(
        'unauthenticated',
        'only authenticated users can add requests'
        );
    }
    if(data.text.length > 30){
        throw new functions.https.HttpsError(
        'invalid-argument',
        'request must be no more than 30 characters long'
        );
    }
   return admin.firestore().collection('requests').add({
        text:data.text,
        upvotes: 0,
    })
});


// upvote callable function
exports.upvote = onCall( async (data,context) => {
    //make sure user is authenticated
    if(!context.auth){
        throw new functions.https.HttpsError(
            'unauthenticated',
            'only authenticated users can add requests'
            );
    }
    // get refs for user doc and request doc
    const user = admin.firestore().collection('users').doc(context.auth.uid);
    const request = admin.firestore().collection('requests').doc(data.id);

    const doc  = await user.get();

    // check user hasn't upvoted the request
    if(doc.data().upvotedOn.includes(data.id)){
        throw new functions.https.HttpsError(
        'failed-precondition',
        'You can only upvote something once'
        );
    }
    //Update user array
    await user.update({
            upvotedOn: [...doc.data().upvotedOn,data.id]
        });
    
    // Update votes on requests
    return request.update({
        upvotes: admin.firestore.FieldValue.increment(1)
    });


    });


    // Firestore trigger for tracking activities.

    exports.logActivities = functions.firestore.document('/{collection}/{id}')
    .onCreate((snap, context) => {
        console.log(snap.data());

        const collection  = context.params.collection;
        const id = context.params.id;

        const activities = admin.firestore().collection('activities');

        if(collection === 'requests'){
            //data is created in requests collection
            return activities.add({text:'a new tutorial request was added'});
        }
        if(collection === 'users'){
            return activities.add({text: 'a new user signed up'});
        }
        return null;

        }
    );
