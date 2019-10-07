import React from 'react';
import {connect} from "react-redux";
import TwitterLogin  from "react-twitter-auth";
import FacebookButton from './FacebookButton';
import {startLogin, initLogin} from "../actions/auth";
import {startSetChannels} from "../actions/channels";
import {startSetProfile} from "../actions/profile";
import {twitterRequestTokenUrl, twitterAccessTokenUrl, backendUrl, facebookAppId, linkedinAppId, pinterestAppId} from "../config/api";
import {registerUser, loginUser} from '../requests/auth';
import {LoaderWithOverlay} from "./Loader";
import LinkedInButton from "./LinkedInButton";
import PinterestButton from "./PinterestButton";

export class LoginPage extends React.Component{

    state = {
        loading: false,
        register: this.props.location.search.indexOf("register") != -1 ? true : false,
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        error: ""
    }

    constructor(props) {
        super(props);
    }

    onFailure = (response) => {
        console.log(response);
    };

    onTwitterSuccess = (response) => {
        this.setState(() => ({loading: true}));
        response.json().then(body => {
            this.props.startLogin(body, "twitter").then(() => {
                this.props.startSetProfile();
                this.props.startSetChannels();
            }).catch(error => {
                this.setState(() => ({loading: false}));
            });
        });
    };

    onFacebookSuccess = (response) => {
        this.setState(() => ({loading: true}));
        this.props.startLogin(response, "facebook").then(() => {
            this.props.startSetProfile();
            this.props.startSetChannels();
        }).catch(error => {
            this.setState(() => ({loading: false}));
        });
    };

    onLinkedInSuccess = (response) => {
        this.setState(() => ({loading: true}));
        this.props.startLogin(response, "linkedin").then(() => {
            this.props.startSetProfile();
            this.props.startSetChannels();
        }).catch(error => {
            this.setState(() => ({loading: false}));
        });
    };

    onPinterestSuccess = (response) => {
        this.setState(() => ({loading: true}));
        this.props.startLogin(response, "pinterest").then(() => {
            this.props.startSetProfile();
            this.props.startSetChannels();
        }).catch(error => {
            this.setState(() => ({loading: false}));
        });
    };

    toggleRegister = () => {
        this.setState(() => ({
            register: !this.state.register
        }));
    };

    onEmailChange = (e) => {
        const email = e.target.value;

        this.setState(() => ({
            email
        }));
    };

    onNameChange = (e) => {
        const name = e.target.value;

        this.setState(() => ({
            name
        }));
    };

    onPasswordChange = (e) => {
        const password = e.target.value;

        this.setState(() => ({
            password
        }));
    };

    onConfirmPasswordChange = (e) => {
        const confirmPassword = e.target.value;

        this.setState(() => ({
            confirmPassword
        }));
    };

    performLogin = (token) => {
        return this.props.initLogin(token).then(() => {
            this.props.startSetProfile();
            this.props.startSetChannels();
        }).catch(e => {
            this.setState(() => ({loading: false}));
            console.log(e);
        });
    };

    onRegisterSubmit = () => {

        this.setState(() => ({loading: true}));
        const data = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password_confirmation: this.state.confirmPassword
        };
        
        registerUser(data).then(response => {
            if(typeof response.accessToken !== "undefined") {
                this.performLogin(response.accessToken);
            }
        }).catch(e => {
            this.setState(() => ({loading: false}));
            if(typeof e.response !== "undefined" && typeof e.response.data.errors !== "undefined"){
                this.setState(() => ({
                    error: Object.values(e.response.data.errors)[0][0]
                }));
                return;
            }

            console.log(e);
        });
    };

    onLoginSubmit = () => {
        this.setState(() => ({loading: true}));
        const data = {
            email: this.state.email,
            password: this.state.password
        };
        
        loginUser(data).then(response => {
            if(typeof response.accessToken !== "undefined") {
                this.performLogin(response.accessToken);
            }
        }).catch(e => {
            this.setState(() => ({loading: false}));
            if(typeof e.response !== "undefined" && typeof e.response.data.error !== "undefined"){
                this.setState(() => ({
                    error: e.response.data.error
                }));

                return;
            }  
            
            console.log(e);
        });
    };

    render(){
        
        return (
            <div className="login-container">                    
                <div className="logo">
                    <img src="/images/uniclix.png" />
                </div>
                {this.state.loading && <LoaderWithOverlay />}
                <div className="col-md-7 col-xs-12 text-center">

                    <div className="col-xs-12 text-center">
                        <div className="form-container">

                            {!this.state.register ?
                                <div className="login-form">
                                    {!!this.state.error.length && 
                                    <div className="alert alert-danger">
                                        {this.state.error}
                                    </div>}

                                    <h3>Login with your Uniclix account</h3>
                                    <div className="form-group">
                                        <label htmlFor="exampleInputEmail1">Email address</label>
                                        <input type="email" onChange={this.onEmailChange} value={this.state.email} className="form-control" placeholder="email@domain.com" id="inputEmail1" aria-describedby="emailHelp" required/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inputPassword1">Password</label>
                                        <input type="password" placeholder="Your account password" onChange={this.onPasswordChange} value={this.state.password} className="form-control" id="inputPassword1" required/>
                                    </div>   
                                    <p className="inline-txt">Forgot your password? &nbsp;<a href={`${backendUrl}/password/reset`} className="btn btn-text-blue"> Recover</a></p>                                 
                                    {this.state.email && this.state.password ?
                                        <button type="submit" onClick={this.onLoginSubmit} className="btn magento-btn full-width">Log in</button> :
                                        <button type="submit" className="btn magento-btn full-width disabled-btn" disabled>Log in</button>
                                    }
                                </div>
                            :
                            <div className="login-form">
                                {!!this.state.error.length && 
                                <div className="alert alert-danger">
                                    {this.state.error}
                                </div>}

                                <h3>Create your Uniclix account</h3>
                                <div className="form-group">
                                    <label htmlFor="inputName1">Full Name</label>
                                    <input type="text" onChange={this.onNameChange} minLength="6" className="form-control" placeholder="John Doe" value={this.state.name} id="inputName1" aria-describedby="emailHelp" required/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inputEmail1">Email address</label>
                                    <input type="email" onChange={this.onEmailChange} minLength="8" placeholder="example@domain.com" className="form-control" value={this.state.email} id="inputEmail1" aria-describedby="emailHelp" required/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inputPassword1">Password</label>
                                    <input type="password" onChange={this.onPasswordChange} minLength="8" placeholder="Use at least 8 characters" 
                                    className={`form-control ${this.state.password !== "" && this.state.password.length < 8 ? 'red-border' : ''}`}
                                    value={this.state.password} id="inputPassword1" required/>
                                </div>
                                <div className="form-group">
                                <label htmlFor="inputConfirmPassword1">Confirm Password</label>
                                    <input type="password" 
                                    placeholder="Repeat the password above"
                                    onChange={this.onConfirmPasswordChange}
                                    className={`form-control 
                                    ${this.state.confirmPassword !== "" && this.state.confirmPassword !== this.state.password ? 'red-border' : ''}`} 
                                    value={this.state.confirmPassword} id="inputConfirmPassword1"
                                    />
                                </div>

                                <p className="inline-txt">I agree with Uniclix <a href={`${backendUrl}/privacy-policy`} target="_blank" className="btn btn-link"> Terms of Services</a></p>
                                {this.state.email && this.state.password && this.state.name && this.state.confirmPassword?
                                    <button type="submit" onClick={this.onRegisterSubmit} className="btn magento-btn full-width">Sign up</button> :
                                    <button type="submit" className="btn magento-btn full-width disabled-btn" disabled>Sign up</button>
                                }
                            </div>
                            }

    
                        </div>
                    </div>

                </div>

                {!this.state.register ?
                    <div className="col-md-5 login-side">
                        <div className="auth-switch-container">
                            <button type="submit"  onClick={this.toggleRegister} className="btn magento-btn full-width">Sign up</button>
                        </div>
                    </div>
                :
                
                    <div className="col-md-5 register-side">
                        <div className="auth-switch-container">
                            <span>Already have an account?</span><button type="submit" onClick={this.toggleRegister} className="btn btn-text-pink auth-switch-btn">Log in</button>
                        </div>
                    </div>
                }
            </div>
        );
    }
};

const mapDispatchToProps = (dispatch) => ({
    initLogin: (token) => dispatch(initLogin(token)),
    startLogin: (body, network) => dispatch(startLogin(body, network)),
    startSetProfile: () => dispatch(startSetProfile()),
    startSetChannels: () => dispatch(startSetChannels())
});

export default connect(undefined, mapDispatchToProps)(LoginPage);