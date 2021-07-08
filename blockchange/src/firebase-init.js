import firebase from "firebase";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCC0SsEsaUgp39eKbVkCd2I4lhWkRgUhDo",
  authDomain: "blockchange-29151.firebaseapp.com",
  projectId: "blockchange-29151",
  storageBucket: "blockchange-29151.appspot.com",
  messagingSenderId: "512304975548",
  appId: "1:512304975548:web:f09f18a466dd17193a0ab9"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();

export default firebase;