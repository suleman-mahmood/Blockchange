import './App.css';
import { useEffect, useState } from 'react';
import firebase, {db} from './firebase-init';
import {Modal, Button, TextInput} from 'react-materialize';
import QRCode from 'qrcode.react';
import QrReader from 'react-qr-reader'
import makeRequest from './MakeRequests'

function App() {

  const [signInCompleted, setSignInCompleted] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [loadVendorDashboard, setLoadVendorDashboard] = useState(false)
  const [loadConsumerDashboard, setLoadConsumerDashboard] = useState(false)

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

      // console.log("User Signed in!");
      setUserInfo(user)
      // console.log(user.uid);

      db.collection("users").doc(user.uid).get()
      .then((result) => {
        if(result.exists){
          // Donot show modal, continue with the dashboard
          // console.log("Show dashboard", result.data());
          const snapshot = result.data();

          if(snapshot.type == "vendor"){
            setLoadVendorDashboard(true)
          }
          else if(snapshot.type == "consumer"){
            setLoadConsumerDashboard(true)
          }
          else {
            console.log("Unknown User Type");
          }
        }
        else{
          // Initialize Wallet

          // var raw = JSON.stringify({"first_name":"John","last_name":"Doe","email":"","ewallet_reference_id":user.uid,"metadata":{"merchant_defined":true},"phone_number":"","type":"person","contact":{"phone_number":"+14155551311","email":"johndoe@rapyd.net","first_name":"John","last_name":"Doe","mothers_name":"Jane Smith","contact_type":"personal","address":{"name":"John Doe","line_1":"123 Main Street","line_2":"","line_3":"","city":"Anytown","state":"NY","country":"US","zip":"12345","phone_number":"+14155551111","metadata":{},"canton":"","district":""},"identification_type":"PA","identification_number":"1234567890","date_of_birth":"11/22/2000","country":"US","nationality":"FR","metadata":{"merchant_defined":true}}});

          // makeRequest('POST', "https://sandboxapi.rapyd.net/v1/user", raw)
          // .then((response) => {
            
            
          // })
          
          // Show Modal 
          setOpenModal(true)
         
        }

        setSignInCompleted(true)
      })

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

  if (openModal) {
    return (<OpenModalComponent 
      userInfo={userInfo}
      />)
  }
  else if(loadConsumerDashboard){
    return (<ConsumerDashboard userInfo={userInfo} />)
  }
  else if(loadVendorDashboard){
    return (<VendorDashboard userInfo={userInfo} />)
  }
  else {
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
    )
  }
}

function OpenModalComponent(props) {

  const [isVendor, setIsVendor] = useState(false)
  const [isConsumer, setIsConsumer] = useState(false)
  const [loadVendorDashboard, setLoadVendorDashboard] = useState(false)
  const [loadConsumerDashboard, setLoadConsumerDashboard] = useState(false)

  useEffect(() => {
    if(isVendor){
      db.collection("users").doc(props.userInfo.uid).set({
        type: "vendor"
      })
      .then(() => {
        // console.log("Added Vendor");
        setLoadVendorDashboard(true);
      })
    }
    if(isConsumer) {
      db.collection("users").doc(props.userInfo.uid).set({
        type: "consumer"
      })
      .then(() => {
        // console.log("Added Consumer");
        setLoadConsumerDashboard(true);
      })
    }
  }, [isVendor, isConsumer])

  if(loadConsumerDashboard){
    return (<ConsumerDashboard userInfo={props.userInfo} />)
  }
  else if(loadVendorDashboard){
    return (<VendorDashboard userInfo={props.userInfo} />)
  }
  else {
    return (
      <div>
        <Modal
          actions={[
            <Button flat modal="close" node="button" waves="green" onClick={() => {setIsVendor(true)}}>Vendor</Button>,
            <Button flat modal="close" node="button" waves="green" onClick={() => {setIsConsumer(true)}}>Consumer</Button>
          ]}
          header="Are you?"
          id="Modal-0"
          open={true}
          options={{
            dismissible: false,
            endingTop: '10%',
            inDuration: 250,
            onCloseEnd: null,
            onCloseStart: null,
            onOpenEnd: null,
            onOpenStart: null,
            opacity: 0.5,
            outDuration: 250,
            preventScrolling: true,
            startingTop: '4%'
          }}
        ></Modal>
      </div>
    )
  }
}

function ConsumerDashboard(props){

  const [acceptTransaction, setAcceptTransaction] = useState(false);
  const [rejectTransaction, setRejectTransaction] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [docData, setDocData] = useState({});
  const [docId, setDocId] = useState({});

  useEffect(() => {
    db.collection("transactions").doc(props.userInfo.uid).collection("myTransactions")
    .onSnapshot((querySnapshot) => {
      var recentDoc = {};
      var recentDocId = "";
      var recentDocExists = false

      querySnapshot.forEach((doc) => {
        recentDoc = doc.data()
        recentDocId = doc.id
        recentDocExists = doc.exists
      });

      if(recentDocExists && !recentDoc.verified){
        // TODO: Verify this doc
        setDocData(recentDoc);
        setDocId(recentDocId)
        setOpenModal(true);
      }
      else{
        console.log("Last transaction already verified");
      }
    })
  });

  useEffect(() => {
    if(acceptTransaction){
      db.collection("transactions").doc(props.userInfo.uid).collection("myTransactions").doc(docId)
      .update({
        verified: true,
      })
      .then(() => {
        console.log("User has verified transaction");
      })
    }
  }, [acceptTransaction, rejectTransaction])

  return(
    <div className="container">
      <div className="row">
        <h1 className="center-align">
          Consumer Dashboard
        </h1>
        <div className="col s2 offset-s5">
          <QRCode value={props.userInfo.uid} />
        </div>
      </div>
      <Modal
          actions={[
            <Button flat modal="close" node="button" waves="green" onClick={() => {setAcceptTransaction(true)}}>Accept</Button>,
            <Button flat modal="close" node="button" waves="green" onClick={() => {setRejectTransaction(true)}}>Reject</Button>
          ]}
          header="Do you verify the follow transaction?"
          id="Modal-0"
          open={openModal}
          options={{
            dismissible: false,
            endingTop: '10%',
            inDuration: 250,
            onCloseEnd: null,
            onCloseStart: null,
            onOpenEnd: null,
            onOpenStart: null,
            opacity: 0.5,
            outDuration: 250,
            preventScrolling: true,
            startingTop: '4%'
          }}
        >
          <p>Store ID: {docData.vendorUid}</p>
          <p>Amount: {docData.amount}</p>
        </Modal>
    </div>
  )
}

function VendorDashboard(props){

  const [qrData, setQrData] = useState()
  const [stopScan, setStopScan] = useState(false)
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [initiateTransaction, setInitiateTransaction] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [finalOpenModal, setFinalOpenModal] = useState(false)

  const handleScan = data => {
    if (data && !stopScan) {
      console.log(data);
      setQrData(data)
      setStopScan(true)
      setOpenModal(true)
    }
  }

  const handleError = err => {
    console.log(err)
  }

  useEffect(() => {
    if(!initiateTransaction)
      return;

    console.log("Initiating Transaction", transactionAmount);

    const consumerUid = qrData;
    db.collection("transactions").doc(consumerUid).collection("myTransactions").doc().set({
      vendorUid: props.userInfo.uid,
      amount: transactionAmount,
      verified: false,
    })
    .then(() => {

      //Waiting for user confirmation
      db.collection("transactions").doc(consumerUid).collection("myTransactions").get()
      .then((querySnapshot) => {
        // console.log(querySnapshot);
        var recentDoc = {};
        var recentDocId = "";

        querySnapshot.forEach((doc) => {
          recentDoc = doc.data()
          recentDocId = doc.id
        });

        //Listen for updates
        var unsubscribe = db.collection("transactions").doc(consumerUid).collection("myTransactions").doc(recentDocId)
        .onSnapshot((doc) => {
          const docData = doc.data()
          console.log("listening on updates", docData);

          if(docData.verified){
            // Continue with the transaction
            console.log("Do that Rapyd transaction you have been waiting for!");
            setFinalOpenModal(true)
            
            // Stop listening for updates
            unsubscribe();
          }
        })
      })
    })

  }, [initiateTransaction])

  return(
    <div className="container">
      <div className="row">
        <h1 className="center-align">
          Vendor Dashboard
        </h1>
        <div className="col s12">
          <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
        </div>
      </div>

      <Modal
          actions={[
            <Button flat modal="close" node="button" waves="green" onClick={() => {setInitiateTransaction(true)}}>Done</Button>
          ]}
          header="Please Enter the amount due by the custumer in the field below"
          id="Modal-0"
          open={openModal}
          options={{
            dismissible: false,
            endingTop: '10%',
            inDuration: 250,
            onCloseEnd: null,
            onCloseStart: null,
            onOpenEnd: null,
            onOpenStart: null,
            opacity: 0.5,
            outDuration: 250,
            preventScrolling: true,
            startingTop: '4%'
          }}
        >
          <TextInput
            id="amount"
            label="Enter Amount"
            onChange={(e) => {setTransactionAmount(e.target.value)}}
          />
        </Modal>

        <Modal
          actions={[
            <Button flat modal="close" node="button" waves="green">OK</Button>
          ]}
          header="The transaction was successfull!"
          id="Modal-0"
          open={finalOpenModal}
          options={{
            dismissible: false,
            endingTop: '10%',
            inDuration: 250,
            onCloseEnd: null,
            onCloseStart: null,
            onOpenEnd: null,
            onOpenStart: null,
            opacity: 0.5,
            outDuration: 250,
            preventScrolling: true,
            startingTop: '4%'
          }}
        >
        </Modal>
    </div>
  )
}

export default App;