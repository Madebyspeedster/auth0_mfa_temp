import React, { Fragment, useCallback, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "reactstrap";

const links = {
  dev: "https://helpmebear.herokuapp.com/level-field",
  prod: "https://helpmebear.herokuapp.com/level-field",
};

const getUserMeta = (user) => {
  return fetch(
    `${links.dev}/get-user-data?userId=${encodeURI(`${user.sub}`)}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((result) => result.json())
    .then((user) => user)
    .catch((e) => {
      console.log(e);
    });
};

const Home = () => {
  const { getAccessTokenWithPopup, user, getIdTokenClaims } = useAuth0();
  const [loading, setIsLoading] = useState(false);
  const [transactionDone, setTransactionIsDone] = useState(false);
  const [shouldGenerateMfa, setShouldGenerateMFA] = useState(false);

  const commitTransaction = useCallback(async () => {
    setIsLoading(true);
    const userInfo = await getUserMeta(user);
    if (!userInfo?.enrolments?.length) {
      setShouldGenerateMFA(true);
      setIsLoading(false);
      return;
    }
    getAccessTokenWithPopup({ confirmTransaction: true })
      .then(() => {
        getIdTokenClaims().then((res) => {
          console.log(res);
        });
        setTransactionIsDone(true);
      })
      .catch((e) => console.log({ e }));
    setIsLoading(false);
  }, [getAccessTokenWithPopup, getIdTokenClaims, user]);

  const generateMFA = useCallback((user) => {
    setIsLoading(true);
    return fetch(
      `${links.dev}/generate-mfa?userId=${encodeURI(`${user.sub}`)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((result) => result.json())
      .then(({ ticket }) => {
        console.log(ticket);
        if (ticket.ticket_url) {
          setShouldGenerateMFA(false);
          const w = 600;
          const h = 600;
          const left = window.screen.width / 2 - w / 2;
          const top = window.screen.height / 2 - h / 2;
          window.open(
            ticket.ticket_url,
            "MFA",
            "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
              w +
              ", height=" +
              h +
              ", top=" +
              top +
              ", left=" +
              left
          );
        }
      })
      .catch((e) => {
        console.log(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <Fragment>
      {user && (
        <Button onClick={commitTransaction}>
          {loading ? "wait" : "confirm transaction"}
        </Button>
      )}
      {transactionDone && <h3 style={{ margin: 15 }}>All good! 🥳</h3>}
      {shouldGenerateMfa && (
        <>
          <h3 style={{ margin: 15 }}>
            Hey, in order to proceed we want you to setup MFA 📱
          </h3>
          <Button onClick={() => generateMFA(user)}>
            {loading ? "wait" : "Setup MFA"}
          </Button>
        </>
      )}
      <hr />
    </Fragment>
  );
};

export default Home;
