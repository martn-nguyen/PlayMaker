import "../styles/Login.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Grid from "@mui/material/Grid";
import SignIn from "./login/SignIn";
import SignUp from "./login/SignUp";
import { useEffect, useState } from "react";
import { auth } from "./login/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
const databaseURL = process.env.REACT_APP_DATABASE_URL;

export default function Login() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user.uid);
        getUser(user.uid);
        /*if(!userData) {
          addUser(user.uid)
        }*/
        navigate("/account");
        console.log("signed in");
      } else {
        console.log(user);
        console.log("not signed in");
        navigate("/");
      }
    });
  }, [navigate, userData]);

  function onGuestClick() {
    signInWithEmailAndPassword(auth, "guest@gmail.com", "123456")
      .then((userCredential) => {
        // signed in
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }

  const getUser = async (userID) => {
    fetch(`${databaseURL}users/${userID}.json`)
      .then((res) => {
        console.log("RES");
        console.log(res);
        if (res.status !== 200) {
          console.log("There was an error: " + res.statusText);
          return;
        } else {
          return res.json();
        }
      })
      .then((res) => {
        if (res) {
          setUserData(res);
        }
      });
  };

  const addUser = async (userID) => {
    if (userID) {
      const data = {
        playCount: 0,
        playIDList: [""],
      };
      return fetch(`${databaseURL + "users/" + userID}.json`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.status !== 200) {
          console.log("There was an error.");
        } else {
          // display current list on screen
          //getNoteData(userName);
        }
      });
    }
  };

  return (
    <div className="Login">
      <h1>
        <b>PlayMaker</b>
      </h1>
      <br />
      <Grid className="GridStyle2" container spacing={1}>
        <Grid className="GridStyle" item xs={6}>
          <SignIn />
        </Grid>
        <Grid className="GridStyle" item xs={6}>
          <SignUp />
        </Grid>
      </Grid>

      <br />
      <Link to="/account">
        <Button className="TealButton" onClick={onGuestClick}>
          Guest
        </Button>
      </Link>
    </div>
  );
}
