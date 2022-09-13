import React, {Fragment, useEffect} from "react";

import Hero from "../components/Hero";
import Content from "../components/Content";
import {useAuth0} from "@auth0/auth0-react";

const Home = () => {
    const {getAccessTokenWithPopup, error, user, getAccessTokenSilently} = useAuth0();

    useEffect(() => {
        getAccessTokenSilently().then(res => {
            console.log(res);
        }).catch(e => {
            console.log('Error', e)
        })
    }, [error, user])
    return (
        <Fragment>
            <Hero />
            {user && (<button onClick={
                () => getAccessTokenWithPopup({ignoreCache: true, confirmTransaction: true})
                    .then(res => console.log({res}))
                    .catch(e => console.log({e}))}>
                confirm transaction
            </button>)}
            <hr />
            <Content />
        </Fragment>
    )
};

export default Home;
