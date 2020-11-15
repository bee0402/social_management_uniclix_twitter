import React from "react";
import ReactDOM from "react-dom";
import ReactGA from 'react-ga';
import { Provider } from "react-redux";
import { Helmet } from 'react-helmet';
import configStore from "./store/configStore";
import AppRouter from "./routes/AppRouter";
import "normalize.css/normalize.css";
import "./styles/styles.scss";
import { login, logout } from "./actions/auth";
import setAuthorizationHeader from "./utils/setAuthorizationHeader";
import { setProfile, startSetProfile } from "./actions/profile";
import { setChannels, startSetChannels } from "./actions/channels";
import { setMiddleware } from "./actions/middleware";
import { facebookPixelID } from './config/api';

const store = configStore();

const trackingId =  process.env.LINKEDIN_APP_ID ? process.env.LINKEDIN_APP_ID : 'UA-139556974-3'; // Replace with your Google Analytics tracking ID



const Root = () => (
    <div>
        <Helmet>
            {
                facebookPixelID ? (
                    <script>
                        {`
                            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${facebookPixelID}');fbq('track', 'PageView');
                        `}
                    </script>
                ) : null
            }
            {
                facebookPixelID ? (
                    <noscript>
                        {`
                            <img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${facebookPixelID}&ev=PageView&noscript=1"/>                                
                        `}
                    </noscript>
                ) : null
            }
        </Helmet>
        <Provider store={store}>
            <AppRouter />
        </Provider>
    </div>
);


let hasRendered = false;

const renderApp = () => {
    if (!hasRendered) {
        ReactGA.initialize(trackingId);
        ReactGA.pageview(window.location.pathname + window.location.search);
        ReactDOM.render(<Root />, document.getElementById("app"));
        hasRendered = true;
    }
};


const setAuthentication = () => {
    let token = localStorage.getItem("token") || undefined;

    token = token == "undefined" || typeof (token) === "undefined" ? undefined : token;

    store.dispatch(login(token));
    setAuthorizationHeader(token);

    if (token && token !== "undefined") {
        let channels = localStorage.getItem("channels");
        channels = channels ? JSON.parse(channels) : [];

        let profile = localStorage.getItem("profile");
        profile = profile ? JSON.parse(profile) : "";

        ReactGA.set({
            userId: profile.user.id,
        })

        if (!profile) {
            localStorage.setItem("token", undefined);
            store.dispatch(logout());
            setAuthorizationHeader(undefined);
        } else {
            if (profile.user.on_board_step == 0) store.dispatch(setMiddleware("channels"));
            if (profile.user.on_board_step == 1) store.dispatch(setMiddleware("hashtag"));
            if (profile.user.on_board_step == 2) store.dispatch(setMiddleware(false));
        }

        new Promise(function (resolve, reject) {
            store.dispatch(setProfile(profile));
            store.dispatch(setChannels(channels));
            return resolve(true);
        }).then(() => {
            store.dispatch(startSetProfile());
            store.dispatch(startSetChannels());
        });
    }

    renderApp();
};

setAuthentication();
