import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useState } from "react";

export default function Notes(props) {
  const [players, setPlayers] = useState("");
  const [stats, setStats] = useState("");
  const [problems, setProblems] = useState("");
  const [comments, setComments] = useState("");

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton style={{ backgroundColor: "#38455D" }}>
        <Modal.Title
          id="contained-modal-title-vcenter"
          style={{ backgroundColor: "#38455D" }}
        >
          Notes
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#38455D" }}>
        <Form style={{ backgroundColor: "#38455D" }}>
          <Form.Group
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
            style={{ backgroundColor: "#38455D" }}
          >
            <Form.Label style={{ backgroundColor: "#38455D" }}>
              Players
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              onChange={(e) => {
                setPlayers(e.target.value);
              }}
              defaultValue={players}
            />
          </Form.Group>
          <Form.Group
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
            style={{ backgroundColor: "#38455D" }}
          >
            <Form.Label style={{ backgroundColor: "#38455D" }}>
              Statistics
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              onChange={(e) => {
                setStats(e.target.value);
              }}
              defaultValue={stats}
            />
          </Form.Group>
          <Form.Group
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
            style={{ backgroundColor: "#38455D" }}
          >
            <Form.Label style={{ backgroundColor: "#38455D" }}>
              Problems
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              onChange={(e) => {
                setProblems(e.target.value);
              }}
              defaultValue={problems}
            />
          </Form.Group>
          <Form.Group
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
            style={{ backgroundColor: "#38455D" }}
          >
            <Form.Label style={{ backgroundColor: "#38455D" }}>
              Comments
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              onChange={(e) => {
                setComments(e.target.value);
              }}
              defaultValue={comments}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
