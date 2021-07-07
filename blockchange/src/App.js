import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import firebase from './firebase-init'

function App() {

  useEffect(() => {
    // firebase.auth().createUserWithEmailAndPassword("sulemanmahmood@gmail.com", "12345678")
    // .then((userCredential) => {
    //   // Signed in 
    //   var user = userCredential.user;
    //   console.log(userCredential);
    //   // ...
    // })
    // .catch((error) => {
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   console.log(errorMessage);
    //   // ..
    // });
  })

  return (
    <div className="container">
        <div className="row">
          <div className="col s12">
            <h6 className="center-align">Welcome to BlockChange!</h6>
          </div>
        </div>
      </div>
  );
}

export default App;
