import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Account from "./components/Account";
import Play from "./components/Play";
import { auth } from "./components/login/firebase";
import { onAuthStateChanged } from "firebase/auth"; 
import { useState, useEffect } from "react";

export default function App() {
  const navigate = useNavigate()
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("signed in");
        console.log(user.uid)
      } else {
        navigate("/");
      }
    });
  }, [navigate]);
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/account" element={<Account />} />
      <Route path="/play" element={<Play />} />
    </Routes>
  );
}
