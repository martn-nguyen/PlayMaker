import logo from "../images/PlayMakerLogo.png";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Account.css";
import Grid from "@mui/material/Grid";
import { auth } from "./login/firebase";
import { signOut } from "firebase/auth";
import blank from "../images/blank_bg.jpg";
import football from "../images/football_bg.png";
import basketball from "../images/basketball_bg.jpg";
import baseball from "../images/baseball_bg.jpg";
import blank_preview from "../images/blank_preview.png";

const databaseURL = process.env.REACT_APP_DATABASE_URL;

function PlayNavButton({
  playID,
  playTitle,
  navClick,
  source,
  playBackground,
}) {
  var backgroundImg = blank;
  if (playBackground === "basketball") {
    backgroundImg = basketball;
  }
  if (playBackground === "baseball") {
    backgroundImg = baseball;
  }
  if (playBackground === "football") {
    backgroundImg = football;
  }
  if (source) {
    console.log("SOURCE");
    return (
      <Grid item xs="4" className="PreviewGrid">
        <Image
          className="PreviewImage"
          onClick={navClick}
          src={source}
          alt={playTitle}
          style={{
            backgroundImage: `url(${backgroundImg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <h5>{playTitle}</h5>
      </Grid>
    );
  } else {
    return (
      <Image
        className="PreviewImage"
        onClick={navClick}
        src={blank_preview}
        alt={playTitle}
      />
    );
  }
}
export default function Account() {
  const [playCount, setPlayCount] = useState(0);
  const [userRes, setUserRes] = useState({});
  const [playIDList, setPlayIDList] = useState([]);
  const navigate = useNavigate();
  const logOut = () => {
    signOut(auth)
      .then(() => {
        console.log("signed out successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (auth.currentUser) {
      console.log("AUTH CURRENT USER");
      const userID = auth.currentUser.uid;
      fetch(`${databaseURL}users/${userID}.json`)
        .then((res) => {
          if (res.status !== 200) {
            console.log("There was an error: " + res.statusText);
            return;
          } else {
            return res.json();
          }
        })
        .then((res) => {
          if (res) {
            console.log(res);
            setUserRes(res);
            console.log("get play count" + res.playCount);
            if ("playIDList" in res) {
              setPlayIDList(res.playIDList);
              setPlayCount(res.playIDList.length);
            } else {
              setPlayCount(0);
            }
          } else {
          }
        });
    }
  }, [setPlayCount]);

  const addPlay = async () => {
    //const userID = auth.currentUser.uid
    if (auth.currentUser) {
      // Data for new Play
      const userID = auth.currentUser.uid;
      const playID = "play" + playCount;
      playIDList.push(playID);
      const newPlayCount = playCount + 1;
      const data = {
        playCount: newPlayCount,
        playIDList: playIDList,
      };

      userRes[playID] = {
        title: "title" + newPlayCount,
        drawings: [],
      };

      //Create new play in DB, then navigate to the play page
      return fetch(`${databaseURL + "users/" + userID}.json`, {
        method: "PATCH",
        body: JSON.stringify(data),
      })
        .then((res) => {
          if (res.status !== 200) {
            console.log("There was an error.");
            return;
          } else {
            console.log("set play count" + newPlayCount);
            console.log(res);
            setPlayCount(newPlayCount);
          }
        })
        .then(() => {
          navigate("/play", {
            state: {
              playID: playID,
              isNewPlay: true,
              playTitle: "title " + newPlayCount,
            },
          });
        });
    }
  };

  return (
    <div className="Account">
      <header>
        <Container className="AccountScreen">
          <Row className="align-items-center">
            <Col className="AccountComponent">
              <h1 className="PlayTitle">
                <b>My Plays</b>
              </h1>
            </Col>
            <Col className="AccountComponent">
              <Button className="CreateButton" onClick={addPlay}>
                <b>Create New Play</b>
              </Button>
            </Col>
          </Row>
        </Container>
      </header>
      <body>
        <Container className="AccountScreen">
          <Container className="ScrollContainer">
            <Grid className="GridStyle3" container>
              {playIDList ? (
                playIDList.map((playID) => (
                  <PlayNavButton
                    playID={playID}
                    playTitle={userRes[playID] ? userRes[playID].title : ""}
                    playBackground={
                      userRes[playID] ? userRes[playID].background : ""
                    }
                    source={userRes[playID] ? userRes[playID].preview : ""}
                    navClick={() => {
                      console.log(userRes[playID]);
                      navigate("/play", {
                        state: {
                          playID: playID,
                          playTitle: userRes[playID]
                            ? userRes[playID].title
                            : "",
                          playBackground: userRes[playID]
                            ? userRes[playID].background
                            : "",
                          isNewPlay: userRes[playID].drawings ? false : true,
                        },
                      });
                    }}
                  />
                ))
              ) : (
                <Row></Row>
              )}
            </Grid>
          </Container>
        </Container>
      </body>
      <footer>
        <Container className="AccountScreen">
          <Row>
            <Col className="AccountComponent">
              <h1 className="PlayTitle">PlayMaker</h1>
              <img src={logo} width={50} alt="PlayMaker logo" />
            </Col>
            <Col className="AccountComponent">
              <Button className="TealButton">Export</Button>
              <Button className="TealButton">Delete</Button>
            </Col>
            <Col className="AccountComponent">
              <Link to="/">
                <Button className="TealButton" onClick={logOut}>
                  <b>Logout</b>
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}
