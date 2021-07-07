import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import firebase from './firebase-init'

function App() {

  const handleLogin = () => {
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
      var credential = result.credential;

      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user);
      // ...
    }).catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.log(errorMessage);
      // ...
    });
  }

  return (

    <div className="main-app valign-wrapper">
      <div className="container">
        <div className="card red lighten-3">
          <div className="card-content">
            <div className="row">
              <h6 className="center-align col s12">Welcome to BlockChange!</h6>

              <a className="waves-effect waves-light btn red lighten-1 col s2 offset-s5" onClick={handleLogin}> Sign In </a>
            </div>
          </div>
        </div>  
      </div>
    </div>
  );
}

export default App;
