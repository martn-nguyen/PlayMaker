import { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const databaseURL = process.env.REACT_APP_DATABASE_URL;
  const onSubmit = async (e) => {
    e.preventDefault();

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // signed in
        const user = userCredential.user;
        addUser(user.uid);
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
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

  const handleEmailChange = (event) => {
    const target = event.target;
    setEmail(target.value);
    console.log(target.value);
  };

  useEffect(() => {
    if (password === password2) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  }, [password, password2]);

  const handlePasswordChange = (event) => {
    const target = event.target;
    setPassword(target.value);
    console.log(target.value);
  };

  const handlePassword2Change = (event) => {
    const target = event.target;
    setPassword2(target.value);
    console.log(target.value);
  };

  return (
    <div className="container" style={{ backgroundColor: "#38455D" }}>
      <h2>
        <b>Sign Up</b>
      </h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Control
            className="form-control-lg"
            rows={1}
            onChange={handleEmailChange}
            placeholder="Email Address"
          />
        </Form.Group>
      </Form>
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Control
            className="form-control-lg"
            rows={1}
            onChange={handlePasswordChange}
            placeholder="Password"
          />
        </Form.Group>
      </Form>
      <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Control
            className="form-control-lg"
            rows={1}
            onChange={handlePassword2Change}
            placeholder="Password"
          />
        </Form.Group>
      </Form>
      {passwordMatch ? <div></div> : <div>Passwords do not match!</div>}
      <Button className="TealButton" type="submit" onClick={onSubmit}>
        Sign Up
      </Button>
    </div>
  );
}
