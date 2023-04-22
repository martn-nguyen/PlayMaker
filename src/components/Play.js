import "../styles/Play.css";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useState, useRef, useEffect } from "react";
import Notes from "./Notes.js";
import Form from "react-bootstrap/Form";
import { SketchPicker } from "react-color";
import blank from "../images/blank_bg.jpg";
import football from "../images/football_bg.png";
import basketball from "../images/basketball_bg.jpg";
import baseball from "../images/baseball_bg.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import NoteIcon from "@mui/icons-material/Note";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SquareOutlinedIcon from "@mui/icons-material/SquareOutlined";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import PanToolAltOutlinedIcon from "@mui/icons-material/PanToolAltOutlined";
import ChangeHistoryOutlinedIcon from "@mui/icons-material/ChangeHistoryOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import RedoOutlinedIcon from "@mui/icons-material/RedoOutlined";
import SaveIcon from "@mui/icons-material/Save";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { auth, storage } from "./login/firebase";

// Drawing function from https://github.com/mikkuayu/React-Projects/blob/main/MyCanvas/my-canvas/src/components/DrawingCanvas/DrawingCanvas.js
// Color Picker Button from https://casesandberg.github.io/react-color/
// Able to drag stuff from https://jsfiddle.net/m1erickson/sEBAC
// Draggable lines from https://stackoverflow.com/questions/5559248/how-to-create-a-draggable-line-in-html5-canvas
// Erasing lines from https://stackoverflow.com/questions/29692134/how-to-delete-only-a-line-from-the-canvas-not-all-the-drawings
// Undo/Redo from https://medium.com/geekculture/react-hook-to-allow-undo-redo-d9d791c5cd94
// Arrows on routes from https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag

// Upload play preview https://www.makeuseof.com/upload-files-to-firebase-using-reactjs/ https://github.com/eligrey/FileSaver.js/issues/263
const databaseURL = process.env.REACT_APP_DATABASE_URL;

function ColorButton({ value, onColorClick, selectedColor }) {
  const cStyle = {
    margin: "0px",
    aspectRatio: 1,
    backgroundColor: value,
    border: "3px solid",
    borderColor: value,
  };
  if (value === "#ffffff") {
    cStyle.borderColor = "#F0F0F0";
  }

  if (selectedColor === value) {
    cStyle.borderColor = "#7DF9FF";
  }

  return (
    <Button className="rounded-circle" onClick={onColorClick} style={cStyle}>
      &nbsp;&nbsp;
    </Button>
  );
}

function ColorPickButton({ value, onColorClick, selectedColor }) {
  const cStyle = {
    aspectRatio: 1,
    backgroundColor: value,
    border: "3px solid",
    borderColor: value,
  };
  if (value === "#FFFFFF") {
    cStyle.borderColor = "#F0F0F0";
  }
  if (selectedColor === value) {
    cStyle.borderColor = "#7DF9FF";
  }
  return (
    <Button className="rounded-circle" onClick={onColorClick} style={cStyle}>
      +
    </Button>
  );
}

export default function Play() {
  const [showNotes, setShowNotes] = useState(false);
  const [color, setColor] = useState("#000000");
  const [currentBackground, changeCurrentBackground] = useState(blank);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const playID = location.state?.playID;
  const playTitle = location.state ? location.state?.playTitle : "Play";
  const [title, setTitle] = useState(playTitle);
  const [savedTime, setSavedTime] = useState("Not Saved");
  const isNewPlay = location.state?.isNewPlay;
  const prevBackground = location.state?.playBackground;

  console.log(location);
  console.log(playID);
  console.log(playTitle);
  console.log(isNewPlay);

  //const userID = auth.currentUser.uid;

  // don't do this in actual industry code
  const [pickerColor, setPickerColor] = useState("#F64D4D");
  const [pickerColor1, setPickerColor1] = useState("#F69E4D");
  const [pickerColor2, setPickerColor2] = useState("#F6E54D");
  const [pickerColor3, setPickerColor3] = useState("#97F64D");
  const [pickerColor4, setPickerColor4] = useState("#4D86F6");
  const [pickerColor5, setPickerColor5] = useState("#000000");
  const [pickerColor6, setPickerColor6] = useState("#ffffff");
  const [pickerColor7, setPickerColor7] = useState("#DD22BD");

  const [showPicker, setShowPicker] = useState(false);
  const [showPicker1, setShowPicker1] = useState(false);
  const [showPicker2, setShowPicker2] = useState(false);
  const [showPicker3, setShowPicker3] = useState(false);
  const [showPicker4, setShowPicker4] = useState(false);
  const [showPicker5, setShowPicker5] = useState(false);
  const [showPicker6, setShowPicker6] = useState(false);
  const [showPicker7, setShowPicker7] = useState(false);

  const [mouseDown, setMouseDown] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  // engage draw mode, drag mode, erase mode
  const [canDraw, setCanDraw] = useState(true);
  const [canDrag, setCanDrag] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);

  // route add-ons, dash/arrows
  const [canArrow, setCanArrow] = useState(false);
  const [canDash, setCanDash] = useState(false);

  // drawings array, contains shapes and lines
  const [drawings, setDrawings] = useState([]);
  const [nearestDrawing, setNearestDrawing] = useState(-1);

  // initial line coords, keep track of beginning of line
  const [initialLineCoords, setInitialLineCoords] = useState([0, 0]);

  // undo/redo arrays
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canvasStates, setCanvasStates] = useState([[]]);

  // sets up and grabs reference to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    // Make it visually fill the positioned parent
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    // ...then set the internal size to match
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
    contextRef.current.globalCompositeOperation = "source-over";

    if (!isNewPlay) {
      loadPlay();
    }
    if (prevBackground === "football") {
      changeCurrentBackground(football);
    } else if (prevBackground === "basketball") {
      changeCurrentBackground(basketball);
    } else if (prevBackground === "baseball") {
      changeCurrentBackground(baseball);
    }
  }, [isNewPlay, prevBackground]);

  const onChange = (event) => {
    // data for submit
    console.log(URL.createObjectURL(event.target.files[0]));
    let bgUrl = URL.createObjectURL(event.target.files[0]);

    changeCurrentBackground(bgUrl);
  };

  const loadPlay = async () => {
    //const userID = auth.currentUser.uid
    if (auth.currentUser) {
      // Data for new Play
      const userID = auth.currentUser.uid;
      fetch(`${databaseURL}users/${userID}/${playID}.json`)
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
            console.log("get play count" + res.playCount);
            if (res.drawings) {
              setDrawings(res.drawings);
            } else {
              setDrawings([]);
            }

            setTitle(res.title);
          } else {
            console.log("erroooorrrr loading");
          }
        });
    }
  };

  const addDrawing = (drawing) => {
    // let newDrawings = [...drawings];
    let newDrawings = JSON.parse(JSON.stringify(drawings));
    let newDrawing = JSON.parse(JSON.stringify(drawing));
    addCanvasState([...newDrawings, newDrawing]);
    setDrawings([...newDrawings, newDrawing]);
    // setDrawings((drawings) => [...drawings, drawing]);
  };

  const addShape = (shapeType) => {
    toggleMode(3);
    let newShape = {
      type: "shape",
      x: 50,
      y: 50,
      color: color,
      shape: shapeType,
    };

    addDrawing(newShape);
    //drawShape(newShape);
  };

  const drawShape = (shape) => {
    contextRef.current.strokeStyle = shape.color;
    contextRef.current.setLineDash([]);
    contextRef.current.beginPath();
    if (shape.shape === "O") {
      contextRef.current.arc(shape.x, shape.y, 20, 0, 2 * Math.PI);
    } else if (shape.shape === "triangle") {
      contextRef.current.moveTo(shape.x, shape.y - 20);
      contextRef.current.lineTo(shape.x + 20, shape.y + 20);
      contextRef.current.lineTo(shape.x - 20, shape.y + 20);
      contextRef.current.lineTo(shape.x, shape.y - 20);
    } else if (shape.shape === "square") {
      contextRef.current.moveTo(shape.x - 20, shape.y - 20);
      contextRef.current.lineTo(shape.x + 20, shape.y - 20);
      contextRef.current.lineTo(shape.x + 20, shape.y + 20);
      contextRef.current.lineTo(shape.x - 20, shape.y + 20);
      contextRef.current.lineTo(shape.x - 20, shape.y - 20);
    } else {
      contextRef.current.beginPath();
      contextRef.current.moveTo(shape.x - 20, shape.y - 20);
      contextRef.current.lineTo(shape.x + 20, shape.y + 20);
      contextRef.current.stroke();
      contextRef.current.closePath();

      contextRef.current.beginPath();
      contextRef.current.moveTo(shape.x - 20, shape.y + 20);
      contextRef.current.lineTo(shape.x + 20, shape.y - 20);
    }
    contextRef.current.stroke();
  };

  // draws lines with dashes and arrows if needed
  const drawLine = (line) => {
    if (line.dash) {
      contextRef.current.setLineDash([10, 10]);
    } else {
      contextRef.current.setLineDash([]);
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(line.startX, line.startY);
    contextRef.current.lineTo(line.endX, line.endY);
    contextRef.current.strokeStyle = line.color;

    if (line.arrow) {
      let headlen = 10;
      let dx = line.endX - line.startX;
      let dy = line.endY - line.startY;
      let angle = Math.atan2(dy, dx);
      contextRef.current.moveTo(line.endX, line.endY);
      contextRef.current.lineTo(
        line.endX - headlen * Math.cos(angle - Math.PI / 6),
        line.endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      contextRef.current.moveTo(line.endX, line.endY);
      contextRef.current.lineTo(
        line.endX - headlen * Math.cos(angle + Math.PI / 6),
        line.endY - headlen * Math.sin(angle + Math.PI / 6)
      );
    }
    contextRef.current.stroke();
  };

  const addCanvasState = (currentDrawing) => {
    // remove all future (redo) states
    console.log(currentIndex);
    let canvasState = JSON.parse(
      JSON.stringify([...canvasStates.slice(0, currentIndex + 1)])
    );
    canvasState.push(currentDrawing);
    // let canvasState = [
    //   ...canvasStates.slice(0, currentIndex + 1),
    //   currentDrawing,
    // ];
    setCanvasStates(canvasState);
    setCurrentIndex(canvasState.length - 1);
    console.log(canvasState);
  };

  const undoAction = () => {
    let newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    setDrawings(canvasStates[newIndex]);
  };

  const redoAction = () => {
    let newIndex = Math.min(canvasStates.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    setDrawings(canvasStates[newIndex]);
  };

  // TODO: implement save function by linking with firebase
  // store drawings into firebase in order to redraw on load
  const save = async () => {
    if (auth.currentUser) {
      // Data for new Play
      //uploadCanvas()
      const userID = auth.currentUser.uid;
      const canvas = canvasRef.current;

      var mediumQuality = canvas.toDataURL("image/png", 0.5);
      var background = "blank";
      if (currentBackground === football) {
        background = "football";
      } else if (currentBackground === basketball) {
        background = "basketball";
      } else if (currentBackground === baseball) {
        background = "baseball";
      }

      console.log(mediumQuality);
      const data = {
        title: title,
        drawings: drawings,
        preview: mediumQuality,
        background: background,
      };

      //Create new play in DB, then navigate to the play page
      return fetch(`${databaseURL + "users/" + userID + "/" + playID}.json`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.status !== 200) {
          console.log("There was an error.");
          return;
        } else {
          const today = new Date();
          let hours = today.getHours();
          let mins = today.getMinutes();
          let suffix = "AM";
          if (hours >= 12) {
            hours = hours % 12;
            suffix = "PM";
          }
          if (mins < 10) {
            mins = "0" + mins;
          }
          const time =
            today.getMonth() +
            "/" +
            today.getDate() +
            ", " +
            hours +
            ":" +
            mins +
            " " +
            suffix;
          setSavedTime(time);
          console.log("play saved successfully");
        }
      });
    }
  };

  const back = async () => {
    save().then(navigate("account"));
  };

  // draws all the shapes on the canvas, updates when array of objects get updated
  useEffect(() => {
    const canvas = canvasRef.current;
    // erases the entire canvas
    // why? so we can infinitely redraw with new coords to simulate "dragging"
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < drawings.length; i++) {
      let currentDrawing = drawings[i];
      if (currentDrawing.type === "shape") {
        drawShape(currentDrawing);
      } else {
        drawLine(currentDrawing);
      }
    }
  }, [drawings]);

  // linear interpolation, needed to calculate closest distance for lines
  const lerp = (a, b, x) => {
    return a + x * (b - a);
  };

  // canvas doesn't recognize lines, just pixels so we have to manually find it ourselves
  // much easier interactivity to have nearest drawing instead of precisely clicking/dragging
  // the actual shape
  const findNearestDrawing = (mouseX, mouseY) => {
    let closestIndex = -1;
    let minDistance = 1000000;

    for (let i = 0; i < drawings.length; i++) {
      let currentDrawing = drawings[i];
      let closestX = 0,
        closestY = 0,
        distanceX = 0,
        distanceY = 0;
      if (currentDrawing.type === "shape") {
        // shape only has to worry about center, not necessarily border
        closestX = currentDrawing.x;
        closestY = currentDrawing.y;
      } else {
        distanceX = currentDrawing.endX - currentDrawing.startX;
        distanceY = currentDrawing.endY - currentDrawing.startY;
        let t =
          ((mouseX - currentDrawing.startX) * distanceX +
            (mouseY - currentDrawing.startY) * distanceY) /
          (distanceX * distanceX + distanceY * distanceY);
        t = Math.max(0, Math.min(1, t)); // not sure if this line is needed
        closestX = lerp(currentDrawing.startX, currentDrawing.endX, t);
        closestY = lerp(currentDrawing.startY, currentDrawing.endY, t);
      }
      distanceX = mouseX - closestX;
      distanceY = mouseY - closestY;
      let distance = distanceX * distanceX + distanceY * distanceY;
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    setNearestDrawing(closestIndex);
  };

  function handleColorClick(value) {
    setColor(value);
    console.log(value);
  }

  function handlePickerChange(value) {
    setPickerColor(value);
  }

  function handlePickerChange1(value) {
    setPickerColor1(value);
  }

  function handlePickerChange2(value) {
    setPickerColor2(value);
  }

  function handlePickerChange3(value) {
    setPickerColor3(value);
  }

  function handlePickerChange4(value) {
    setPickerColor4(value);
  }

  function handlePickerChange5(value) {
    setPickerColor5(value);
  }

  function handlePickerChange6(value) {
    setPickerColor6(value);
  }

  function handlePickerChange7(value) {
    setPickerColor7(value);
  }

  function handlePickerClick() {
    setShowPicker(!showPicker);
  }

  function handlePickerClose() {
    setShowPicker(false);
    setColor(pickerColor);
  }

  function handlePickerClick1() {
    setShowPicker1(!showPicker1);
  }

  function handlePickerClose1() {
    setShowPicker1(false);
    setColor(pickerColor1);
  }

  function handlePickerClick2() {
    setShowPicker2(!showPicker2);
  }

  function handlePickerClose2() {
    setShowPicker2(false);
    setColor(pickerColor2);
  }

  function handlePickerClick3() {
    setShowPicker3(!showPicker3);
  }

  function handlePickerClose3() {
    setShowPicker3(false);
    setColor(pickerColor3);
  }

  function handlePickerClick4() {
    setShowPicker4(!showPicker4);
  }

  function handlePickerClose4() {
    setShowPicker4(false);
    setColor(pickerColor4);
  }

  function handlePickerClick5() {
    setShowPicker5(!showPicker5);
  }

  function handlePickerClose5() {
    setShowPicker5(false);
    setColor(pickerColor5);
  }

  function handlePickerClick6() {
    setShowPicker6(!showPicker6);
  }

  function handlePickerClose6() {
    setShowPicker6(false);
    setColor(pickerColor6);
  }

  function handlePickerClick7() {
    setShowPicker7(!showPicker7);
  }

  function handlePickerClose7() {
    setShowPicker7(false);
    setColor(pickerColor7);
  }

  const popover = {
    position: "absolute",
    zIndex: "2",
  };

  const cover = {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  };

  // onMouseDown
  const startDrawing = ({ nativeEvent }) => {
    // can only draw if selected, so we can have separate drag mode
    const { offsetX, offsetY } = nativeEvent;
    nativeEvent.preventDefault();
    findNearestDrawing(offsetX, offsetY);
    if (eraseMode) {
      // erase mode, delete the nearest drawing and redraw
      // let newDrawings = [
      //   ...drawings.slice(0, nearestDrawing),
      //   ...drawings.slice(nearestDrawing + 1, drawings.length),
      // ];
      let newDrawings = JSON.parse(
        JSON.stringify([
          ...drawings.slice(0, nearestDrawing),
          ...drawings.slice(nearestDrawing + 1, drawings.length),
        ])
      );
      addCanvasState(newDrawings);
      setDrawings(newDrawings);
    } else if (canDraw) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      setInitialLineCoords([offsetX, offsetY]);
    } else {
      // drag mode
      setLastX(offsetX);
      setLastY(offsetY);
    }
    setMouseDown(true);
  };

  // onMouseMove
  const draw = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    nativeEvent.preventDefault();
    if (eraseMode) {
      // why? because it's not updating fast enough apparently
      findNearestDrawing(offsetX, offsetY);
      return;
    }
    if (canDrag && mouseDown) {
      // drag mode (mouse down and can't draw)
      // find nearest drawing and it will be dragged
      if (nearestDrawing !== -1) {
        let draggedDrawing = drawings[nearestDrawing];
        if (draggedDrawing.type === "shape") {
          draggedDrawing.x += offsetX - lastX;
          draggedDrawing.y += offsetY - lastY;
        } else {
          draggedDrawing.startX += offsetX - lastX;
          draggedDrawing.startY += offsetY - lastY;
          draggedDrawing.endX += offsetX - lastX;
          draggedDrawing.endY += offsetY - lastY;
        }

        let newDrawings = [...drawings];
        newDrawings[nearestDrawing] = draggedDrawing;
        setDrawings(newDrawings);
        setLastX(offsetX);
        setLastY(offsetY);
        // drawEverything(drawings);
      }
    } else if (canDraw && mouseDown) {
      // paint mode (mouse down and can draw)
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      contextRef.current.strokeStyle = color;
    } else {
      // else do nothing
      return;
    }
  };

  // onMouseUp, onMouseLeave
  // stop drawing, so straighten out any lines and add it to existing lines
  const stopDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.closePath();
    if (eraseMode) {
      setMouseDown(false);
      return;
    }
    if (canDraw && mouseDown) {
      let currentLine = {
        type: "line",
        startX: initialLineCoords[0],
        startY: initialLineCoords[1],
        endX: offsetX,
        endY: offsetY,
        color: color,
        arrow: canArrow,
        dash: canDash,
      };

      addDrawing(currentLine);
    }
    if (canDrag && mouseDown) {
      let newDrawing = JSON.parse(JSON.stringify(drawings));
      addCanvasState(newDrawing);
    }
    setMouseDown(false);
    findNearestDrawing(offsetX, offsetY);
  };

  const toggleMode = (mode) => {
    setEraseMode(false);
    setCanDraw(false);
    setCanDrag(false);
    if (mode === 1) {
      setEraseMode(true);
    } else if (mode === 2) {
      setCanDraw(true);
    } else {
      setCanDrag(true);
    }
  };

  const toggleRoute = (mode1, mode2) => {
    setCanDash(mode1);
    setCanArrow(mode2);
    toggleMode(2);
  };

  return (
    <div>
      <Container>
        <Row>
          <Col className="headerBorder" xs lg="3">
            <Link to="/account">
              <Button className="smallTealButton" onClick={() => back()}>
                Back
              </Button>
            </Link>
            <ButtonGroup>
              <Button className="smallTealButton" onClick={() => undoAction()}>
                <UndoOutlinedIcon />
              </Button>
              <Button className="smallTealButton" onClick={() => redoAction()}>
                <RedoOutlinedIcon />
              </Button>
            </ButtonGroup>
            <Button className="smallTealButton" onClick={() => save()}>
              <SaveIcon />
            </Button>
          </Col>
          <Col className="headerBorder">
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Control
                  size="md"
                  type="text"
                  rows={1}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  defaultValue={title}
                />
              </Form.Group>
            </Form>
          </Col>
          <Col className="headerBorder" xs lg="2">
            <Button
              variant="primary"
              className="NotesButton smallTealButton"
              onClick={() => setShowNotes(true)}
            >
              Show Notes <NoteIcon></NoteIcon>
            </Button>
            <Notes show={showNotes} onHide={() => setShowNotes(false)} />
          </Col>
          <Col className="headerBorder" xs lg="2">
            <Row style={{ backgroundColor: "#38455D" }}>
              User: {auth.currentUser ? auth.currentUser.email : "error"}
            </Row>
            <Row style={{ backgroundColor: "#38455D" }}>Saved: {savedTime}</Row>
          </Col>
        </Row>
        <Row>
          <Col xs lg="3">
            <Row className="containerBorder">
              <h3>Shapes</h3>
              <Container style={{ backgroundColor: "#38455D" }}>
                <ButtonGroup>
                  <Button
                    className="smallTealButton"
                    onClick={() => addShape("O")}
                  >
                    <CircleOutlinedIcon />
                  </Button>
                  <Button
                    className="smallTealButton"
                    onClick={() => addShape("X")}
                  >
                    <CloseOutlinedIcon />
                  </Button>
                  <Button
                    className="smallTealButton"
                    onClick={() => addShape("triangle")}
                  >
                    <ChangeHistoryOutlinedIcon />
                  </Button>
                  <Button
                    className="smallTealButton"
                    onClick={() => addShape("square")}
                  >
                    <SquareOutlinedIcon />
                  </Button>
                </ButtonGroup>

                <ButtonGroup>
                  <Button
                    className={
                      canDraw === true &&
                      canDash === false &&
                      canArrow === false
                        ? "active"
                        : "smallTealButton"
                    }
                    onClick={() => toggleRoute(false, false)}
                  >
                    —
                  </Button>
                  <Button
                    className={
                      canDraw === true && canDash === true && canArrow === false
                        ? "active"
                        : "smallTealButton"
                    }
                    onClick={() => toggleRoute(true, false)}
                  >
                    - - -
                  </Button>
                  <Button
                    className={
                      canDraw === true && canDash === false && canArrow === true
                        ? "active"
                        : "smallTealButton"
                    }
                    onClick={() => toggleRoute(false, true)}
                  >
                    —{">"}
                  </Button>
                  <Button
                    className={
                      canDraw === true && canDash === true && canArrow === true
                        ? "active"
                        : "smallTealButton"
                    }
                    onClick={() => toggleRoute(true, true)}
                  >
                    - - -{">"}
                  </Button>
                </ButtonGroup>
                <ButtonGroup>
                  <Button
                    className={canDrag === true ? "active" : "smallTealButton"}
                    onClick={() => toggleMode(3)}
                  >
                    Drag
                    <PanToolAltOutlinedIcon />
                  </Button>
                  <Button
                    className={
                      eraseMode === true ? "active" : "smallTealButton"
                    }
                    onClick={() => toggleMode(1)}
                  >
                    Erase <BackspaceOutlinedIcon />
                  </Button>
                </ButtonGroup>
                <Button
                  className={"smallTealButton"}
                  onClick={() => {
                    addCanvasState([]);
                    setDrawings([]);
                    toggleMode(2);
                  }}
                >
                  Clear All <ClearAllIcon />
                </Button>
              </Container>
            </Row>
            <Row className="containerBorder">
              <h3>Colors</h3>
              <Container fluid style={{ backgroundColor: "#38455D" }}>
                <Row style={{ backgroundColor: "#38455D" }}>
                  <Col style={{ backgroundColor: "#38455D" }}>
                    <ColorPickButton
                      value={pickerColor}
                      onColorClick={() => handlePickerClick()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose} />
                      <SketchPicker
                        color={pickerColor}
                        onChange={(color) => handlePickerChange(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                  <Col style={{ backgroundColor: "#38455D" }}>
                    <ColorPickButton
                      value={pickerColor1}
                      onColorClick={() => handlePickerClick1()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker1 ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose1} />
                      <SketchPicker
                        color={pickerColor1}
                        onChange={(color) => handlePickerChange1(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                  <Col style={{ backgroundColor: "#38455D" }}>
                    <ColorPickButton
                      value={pickerColor2}
                      onColorClick={() => handlePickerClick2()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker2 ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose2} />
                      <SketchPicker
                        color={pickerColor2}
                        onChange={(color) => handlePickerChange2(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                  <Col style={{ backgroundColor: "#38455D" }}>
                    <ColorPickButton
                      value={pickerColor3}
                      onColorClick={() => handlePickerClick3()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker3 ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose3} />
                      <SketchPicker
                        color={pickerColor3}
                        onChange={(color) => handlePickerChange3(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                </Row>
                <Row>
                  <Col style={{ backgroundColor: "#38455D" }}>
                  <ColorPickButton
                      value={pickerColor4}
                      onColorClick={() => handlePickerClick4()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker4 ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose4} />
                      <SketchPicker
                        color={pickerColor4}
                        onChange={(color) => handlePickerChange4(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                  <Col style={{ backgroundColor: "#38455D" }}>
                  <ColorPickButton
                      value={pickerColor5}
                      onColorClick={() => handlePickerClick5()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker5 ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose5} />
                      <SketchPicker
                        color={pickerColor5}
                        onChange={(color) => handlePickerChange5(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                  <Col style={{ backgroundColor: "#38455D" }}>
                  <ColorPickButton
                      value={pickerColor6}
                      onColorClick={() => handlePickerClick6()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker6 ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose6} />
                      <SketchPicker
                        color={pickerColor6}
                        onChange={(color) => handlePickerChange6(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                  <Col style={{ backgroundColor: "#38455D" }}>
                  <ColorPickButton
                      value={pickerColor7}
                      onColorClick={() => handlePickerClick7()}
                      selectedColor={color}
                    ></ColorPickButton>
                  </Col>
                  {showPicker7 ? (
                    <div style={popover}>
                      <div style={cover} onClick={handlePickerClose7} />
                      <SketchPicker
                        color={pickerColor7}
                        onChange={(color) => handlePickerChange7(color.hex)}
                        onChangeComplete={(color) =>
                          handleColorClick(color.hex)
                        }
                      />
                    </div>
                  ) : null}
                </Row>
              </Container>
            </Row>
            <Row className="containerBorder">
              <h3>Templates</h3>
              <Container style={{ backgroundColor: "#38455D" }}>
                <ButtonGroup>
                  <Button
                    className={
                      currentBackground === football
                        ? "active"
                        : "smallTealButton"
                    }
                    onClick={() => changeCurrentBackground(football)}
                  >
                    <SportsFootballIcon />
                  </Button>
                  <Button
                    className={
                      currentBackground === basketball
                        ? "active"
                        : "smallTealButton"
                    }
                    onClick={() => changeCurrentBackground(basketball)}
                  >
                    <SportsBasketballIcon />
                  </Button>
                  <Button
                    className={
                      currentBackground === baseball
                        ? "active"
                        : "smallTealButton"
                    }
                    onClick={() => changeCurrentBackground(baseball)}
                  >
                    <SportsBaseballIcon />
                  </Button>
                  <Button
                    className="smallTealButton"
                    onClick={() => changeCurrentBackground(blank)}
                  >
                    Blank
                  </Button>
                </ButtonGroup>
                <label>Upload Template</label>
                <input
                  className="smallTealButton"
                  type="file"
                  onChange={onChange}
                ></input>
              </Container>
            </Row>
          </Col>
          <Col className="containerBorder">
            <canvas
              // background image
              style={{
                backgroundImage: `url(${currentBackground})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
              className="Canvas"
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            ></canvas>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
