import React from "react";
import ReactDOM from "react-dom";
import ReactGA from 'react-ga';
import { Provider } from "react-redux";
import configStore from "./store/configStore";
import AppRouter from "./routes/AppRouter";
import "normalize.css/normalize.css";
import "./styles/styles.scss";
import { login, logout } from "./actions/auth";
import setAuthorizationHeader from "./utils/setAuthorizationHeader";
import { setProfile, startSetProfile } from "./actions/profile";
import { setChannels, startSetChannels } from "./actions/channels";
import { setMiddleware } from "./actions/middleware";

const store = configStore();

const trackingId = "UA-139556974-3"; // Replace with your Google Analytics tracking ID



const Root = () => (
    <div>
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
            if (profile.user.on_board_step == 2) store.dispatch(setMiddleware("connections"));
            if (profile.user.on_board_step > 2) store.dispatch(setMiddleware(false));
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
