const functions = require("firebase-functions");
const firebase = require("firebase-admin");
firebase.initializeApp();
// const firestore = firebase.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/*
exports.sendTestChat = functions.pubsub
    .schedule("every 5 minutes")
    .onRun( (context) => {
      const chats = firestore.collection("servers/Beta/chat/rooms/global");
      // const chat = chats.where("isPayingUser", "==", false).get();
      chats.add({msg: "Scheduled Message", from: "Scheduled Function"});
      return null;
    });
*/
exports.sendChat= functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
