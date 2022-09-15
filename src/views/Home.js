import React, {Fragment, useCallback, useState} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {Button} from "reactstrap";



const getUserMeta = (user) => {
    return fetch(`https://helpmebear.herokuapp.com/level-field/get-user-data?userId=${encodeURI(`${user.sub}`)}`,  {
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(result => result.json())
        .then(user => user)
        .catch(e => {
            console.log(e)
        })
}




const Home = () => {
    const {getAccessTokenWithPopup, user} = useAuth0();
    const [loading, setIsLoading] = useState(false);
    const [transactionDone, setTransactionIsDone] = useState(false);
    const [shouldGenerateMfa, setShouldGenerateMFA] = useState(false);

    const commitTransaction = useCallback(async () => {
        setIsLoading(true);
        const userInfo = await getUserMeta(user);
        if(!userInfo?.enrolments?.length) {
            setShouldGenerateMFA(true);
            setIsLoading(false);
            return;
        }
        getAccessTokenWithPopup({confirmTransaction: true})
            .then(() => setTransactionIsDone(true))
            .catch(e => console.log({e}))
        setIsLoading(false);
    }, [getAccessTokenWithPopup, user]);

    const generateMFA = useCallback((user) => {
        setIsLoading(true);
        return fetch(`https://helpmebear.herokuapp.com/level-field/generate-mfa?userId=${encodeURI(`${user.sub}`)}`,  {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(result => result.json())
            .then(({ticket}) => {
                console.log(ticket)
                if(ticket.ticket_url){
                    setShouldGenerateMFA(false);
                    window.open(ticket.ticket_url,  "mozillaWindow", "popup")
                }
            })
            .catch(e => {
                console.log(e)
            })
            .finally(() => {setIsLoading(false)})
    }, [])

    return (
        <Fragment>
            {user && (<Button onClick={commitTransaction}> {loading ? 'wait' : 'confirm transaction' }</Button>)}
            {transactionDone && (
                <h3 style={{margin: 15}}>All good! 🥳</h3>
            )}
            {shouldGenerateMfa && (
               <>
                   <h3 style={{margin: 15}}>Hey, in order to proceed we want you to setup MFA 📱</h3>
                   <Button onClick={() => generateMFA(user)}>{loading ? 'wait': 'Setup MFA'}</Button>
               </>
            )}
            <hr/>
        </Fragment>
    )
};

export default Home;
