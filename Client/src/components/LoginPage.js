import React from 'react';
import { connect } from "react-redux";
import RegisterPage from "./Register";
import { startLogin, initLogin } from "../actions/auth";
import { startSetChannels } from "../actions/channels";
import { startSetProfile } from "../actions/profile";
import { backendUrl } from "../config/api";
import { loginUser } from '../requests/auth';
import { LoaderWithOverlay } from "./Loader";
import ReactGA from 'react-ga';

export class LoginPage extends React.Component {

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

    onLoginSubmit = () => {
        this.setState(() => ({ loading: true }));
        const data = {
            email: this.state.email,
            password: this.state.password
        };

        loginUser(data).then(response => {
            if (typeof response.accessToken !== "undefined") {
                this.performLogin(response.accessToken);
            }
            ReactGA.event({
                category: "Login ",
                action: "User pressed the login button",
            });

        }).catch(e => {
            this.setState(() => ({ loading: false }));
            if (typeof e.response !== "undefined" && typeof e.response.data.error !== "undefined") {
                this.setState(() => ({
                    error: e.response.data.error
                }));

                return;
            }

            console.log(e);
        });
    };

    performLogin = (token) => {
        return this.props.initLogin(token).then(() => {
            this.props.startSetProfile();
            this.props.startSetChannels();
        }).catch(e => {
            this.setState(() => ({ loading: false }));
        });
    };

    render() {

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
                                        <input type="email" onChange={this.onEmailChange} value={this.state.email} className="form-control" placeholder="email@domain.com" id="inputEmail1" aria-describedby="emailHelp" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inputPassword1">Password</label>
                                        <input type="password" placeholder="Your account password" onChange={this.onPasswordChange} value={this.state.password} className="form-control" id="inputPassword1" required />
                                    </div>
                                    <p className="inline-txt">Forgot your password? &nbsp;<a href={`${backendUrl}/password/reset`} className="btn btn-text-blue"> Recover</a></p>
                                    {this.state.email && this.state.password ?
                                        <button type="submit" onClick={this.onLoginSubmit} className="btn magento-btn full-width">Log in</button> :
                                        <button type="submit" className="btn magento-btn full-width disabled-btn" disabled>Log in</button>
                                    }
                                </div>
                                :
                                <RegisterPage register={this.state.register} />
                            }


                        </div>
                    </div>

                </div>

                {!this.state.register ?
                    <div className="col-md-5 login-side">
                        <div className="auth-switch-container">
                            <button type="submit" onClick={this.toggleRegister} className="btn magento-btn full-width">Sign up</button>
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