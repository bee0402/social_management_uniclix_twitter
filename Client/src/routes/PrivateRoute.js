import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import TopMenu from "../components/Menus/TopMenu";
import Composer from "../components/Compose";
import EmailChecker from "../components/EmailChecker";
import ActiveChecker from "../components/ActiveChecker";
import Middleware from "../components/Middleware";
import MiddlewareHashtag from "../components/MiddlewareHashtag";
import MiddlewareConnections from "../components/MiddlewareConnections";
import SocialAccountsPrompt from "../components/SocialAccountsPrompt";

import {
    BrowserView,
    MobileView
} from "react-device-detect";

export const PrivateRoute = ({
    isAuthenticated,
    middleware,
    middlewareHashtags,
    middlewareSuggested,
    component: Component,
    ...rest }) => (
        <Route {...rest} component={(props) => (
            isAuthenticated ?
                ((!!middleware)
                    ?
                    <div>
                        {(middleware == 'channels' || middleware == "loading") ?
                            <Middleware /> :
                            (middleware == 'hashtag') ?
                                <div><MiddlewareHashtag /></div> :
                                <div><MiddlewareConnections /></div>
                        }
                    </div>
                    :
                    <div>
                        <div className="app-wrap">
                            <TopMenu />
                            <Component {...props} />
                            <Composer />
                            <EmailChecker />
                            <ActiveChecker />
                        </div>
                        {/* <MobileView viewClassName="app-wrap">
                            <div className="">
                                <TopMenu />
                                <Component {...props} />
                                <Composer />
                                <EmailChecker />
                                <ActiveChecker />
                            </div>
                        </MobileView> */}
                    </div>
                ) : (
                    <Redirect to="/" />
                )
        )} />
    );

const mapStateToProps = (state) => ({
    isAuthenticated: !!state.auth.token,
    middleware: state.middleware.step,
    middlewareHashtags: state.middleware.stepHashtags,
    middlewareSuggested: state.middleware.stepSuggested
});

export default connect(mapStateToProps)(PrivateRoute);