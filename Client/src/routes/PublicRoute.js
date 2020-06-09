import React from 'react';
import {connect} from 'react-redux';
import {Route, Redirect, withRouter} from 'react-router-dom';

export const PublicRoute = ({
    isAuthenticated, 
    component: Component, 
    ...rest}) => (
    <Route {...rest} component={(props) => {
        let redirect = '/twitter-booster/dashboard';
        
        return (
            !isAuthenticated ? 
            (   <div>
                    <Component {...props} />
                </div>
            ) : (
                <Redirect to={`${redirect}`} />
            )
        )}
    } />
);

const mapStateToProps = (state) => ({
    isAuthenticated: !!state.auth.token
});

export default connect(mapStateToProps)(withRouter(PublicRoute));