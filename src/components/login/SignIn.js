import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
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
  };

  const handleEmailChange = (event) => {
    const target = event.target;
    setEmail(target.value);
    console.log(target.value);
  };

  const handlePasswordChange = (event) => {
    const target = event.target;
    setPassword(target.value);
    console.log(target.value);
  };

  return (
    <div className="container" style={{ backgroundColor: "#38455D" }}>
      <h2>
        <b>Login</b>
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
      <Button className="TealButton" onClick={onSubmit}>
        Login
      </Button>
    </div>
  );
}
