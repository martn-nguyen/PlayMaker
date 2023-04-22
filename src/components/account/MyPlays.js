import "../../styles/MyPlays.css";
import React from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth } from "../login/firebase";
import { signOut } from "firebase/auth";

export default function MyPlays() {
  return <Container className="ScrollContainer"></Container>;
}
