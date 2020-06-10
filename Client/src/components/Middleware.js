import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { setMiddleware, setHashtags, setConnects } from '../actions/middleware';
import TwitterLogin from 'react-twitter-auth';
import { startSetChannels, startAddTwitterChannel } from "../actions/channels";
import { startSetProfile } from "../actions/profile";
import { twitterRequestTokenUrl, twitterAccessTokenUrl } from "../config/api";
import { changePlan, activateAddon, getPlanData } from '../requests/billing';
import channelSelector from "../selectors/channels";
import { destroyChannel } from "../requests/channels";
import Loader, { LoaderWithOverlay } from './Loader';
import { getParameterByName } from "../utils/helpers";
import Checkout from "./Settings/Sections/Checkout";
import SweetAlert from "sweetalert2-react";

class Middleware extends React.Component {

    state = {
        continueBtn: this.props.channels.length > 0,
        twitterBooster: this.props.location.search.indexOf('twitter-booster') != -1,
        billingPeriod: getParameterByName("period", this.props.location.search) || "annually",
        plan: getParameterByName("plan", this.props.location.search),
        addon: getParameterByName("addon", this.props.location.search),
        addonTrial: getParameterByName("addontrial", this.props.location.search),
        allPlans: [],
        loading: false,
        forbidden: false,
        error:""
    }

    twitterRef = React.createRef();

    componentDidMount() {
        const { profile } = this.props;

        if ((this.state.plan || this.state.addon) && !!profile && !profile.subscription.activeSubscription && !profile.addon.activeAddon) {
            this.props.setMiddleware("billing");
            getPlanData().then(response => {
                this.setState({
                    allPlans: response.allPlans
                });
            });
            return;
        }

        const middleware = this.props.channels.length < 1;

        if (!middleware) {
            this.props.setMiddleware('hashtag');
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.channels !== this.props.channels) {
            this.setState(() => ({
                continueBtn: this.props.channels.length > 0
            }));
        }

        if (prevProps.profile.subscription !== this.props.profile.subscription || prevProps.profile.addon !== this.props.profile.addon) {
            if ((this.state.plan || this.state.addon) && !this.props.profile.subscription.activeSubscription && !this.props.profile.addon.activeAddon && !this.state.addonTrial) {
                this.props.setMiddleware("billing");
                return;
            } else {
                if (this.props.channels.length < 1) {
                    this.props.setMiddleware("channels");
                    return;
                }else{
                    this.props.setMiddleware('hashtag');
                    this.setState({loading: false})
                }
            }
        }
    }

    onFailure = (response) => {
        this.setState(() => ({ loading: false }));
    };

    setError = (error) => {
        this.setState(() => ({
            error
        }));
    };

    setForbidden = (forbidden = false) => {
        this.setState(() => ({
            forbidden
        }));
    };

    setLoading = (loading = false) => {
        this.setState(() => ({
            loading
        }));
    };

    setRole = () => {
        let plan = getParameterByName("plan", this.props.location.search);
        let addon = getParameterByName("addon", this.props.location.search);
        this.setState(() => ({ loading: true }));

        if (plan) {
            changePlan(plan).then(response => {
                this.props.startSetProfile().then(() => {
                    this.setState(() => ({ loading: false }));
                    this.props.setMiddleware(false);
                });
            }).then()
                .catch(error => {
                    if (error.response.status === 403) {
                        this.setState(() => ({
                            forbidden: true,
                            error: error.response.data.error,
                            redirect: error.response.data.redirect
                        }))
                    } else {
                        this.setError("Something went wrong!");
                    }
                });

            return;
        }

        if (addon) {
            activateAddon(addon).then(response => {
                this.props.startSetProfile();
            });

            return;
        }

        this.props.startSetProfile().then(() => {
            this.setState(() => ({ loading: false }));
            this.props.setMiddleware('hashtag');
            this.props.middlewareHashtags('hashtag');
        });
    };

    onTwitterSuccess = (response) => {
        this.setState(() => ({ loading: true }));
        try {
            response.json().then(body => {
                this.props.startAddTwitterChannel(body.oauth_token, body.oauth_token_secret)
                    .then(response => {
                        this.setState(() => ({ loading: false }));
                    })
                    .catch(error => {
                        this.setState(() => ({ loading: false }));
                        if (error.response.status === 403) {
                            this.setForbidden(true);
                            return;
                        }
    
                        if (error.response.status === 409) {
                            this.setError("This twitter account is already registered from another uniclix account.");
                        }
                        else {
                            this.setError("Something went wrong!");
                        }
                    });
            });
        } catch (e) {
        }
    };

    setBillingPeriod = () => {
        this.setState(() => ({ billingPeriod: this.state.billingPeriod === "annually" ? "monthly" : "annually" }));
    };

    remove = (id) => {
        this.setState(() => ({ loading: true }));
        return destroyChannel(id)
            .then((response) => {
                this.setState(() => ({ loading: false }));
                this.props.startSetChannels()
                    .then((response) => {
                    });
            }).catch((e) => {
                this.setState(() => ({ loading: false }));
                if (typeof e.response !== "undefined" && typeof e.response.data.error !== "undefined") {
                    this.setState(() => ({
                        error: e.response.data.error
                    }));
                    return;
                }
            });
    }

    render() {
        const { middleware, channels, middlewareHashtags } = this.props;
        const { continueBtn, loading, twitterBooster, allPlans, addon, addonTrial, error } = this.state;
        let planParam = getParameterByName("plan", this.props.location.search);
        let planData = allPlans.filter(plan => plan["Name"].toLowerCase() === planParam);
        planData = planData.length > 0 ? planData[0] : false;
        let planName = "";
        if (planData) {
            planName = this.state.billingPeriod === "annually" ? planData["Name"].toLowerCase() + "_annual" : planData["Name"].toLowerCase();
        }

        return (
            <div className="login-container">
                <div className="logo">
                    <img src="/images/uniclix.png" />
                </div>

                <SweetAlert
                    show={!!error}
                    title={`Error`}
                    text={error}
                    type="error"
                    confirmButtonText="Ok"
                    cancelButtonText="No"
                    onConfirm={() => {
                        this.setError("");
                    }}
                />
                {middleware !== "channels" && middleware !== "billing" && <Loader />}
                {loading && <LoaderWithOverlay />}

                <div className="col-md-7 col-xs-12 text-center">
                    <div className="col-xs-12 text-center">
                        {middleware == "channels" &&
                            <div className="box channels-box">
                                {middleware !== "loading" && <h2>Connect your Twitter account</h2>}
                                <h5>Cats who destroy birds. Eat an easter feather as if it were a bird then burp victoriously</h5>

                                <div className="channel-buttons">

                                    {channels.length > 0 ?

                                        channels.map(channel => (
                                            <div key={channel.id} className="twitter-middleware-btn added-channel-btn">

                                                <div className="channel-profile-info">
                                                    <img className="channel-profile-picture" src={channel.avatar} />
                                                    <div>
                                                        <p className="channel-profile-type">@{channel.username}</p>
                                                    </div>

                                                </div>
                                                <i className="fa fa-trash" onClick={() => this.remove(channel.id)}></i>
                                            </div>
                                        ))

                                        :
                                        <button className="col-md-12 twitter-middleware-btn" onClick={(e) => this.twitterRef.current.onButtonClick(e)}> <i className="fab fa-twitter"></i> Twitter</button>
                                    }

                                    <TwitterLogin loginUrl={twitterAccessTokenUrl}
                                        onFailure={this.onFailure} 
                                        onSuccess={this.onTwitterSuccess}
                                        requestTokenUrl={twitterRequestTokenUrl}
                                        showIcon={false}
                                        forceLogin={true}
                                        className="hide"
                                        ref={this.twitterRef}
                                    ></TwitterLogin>

                                </div>

                                {
                                    continueBtn ?
                                        <button className="magento-btn w100" onClick={this.setRole}>Continue to Uniclix</button>
                                        :
                                        <button className="magento-btn w100 disabled-btn">Continue to Uniclix</button>
                                }
                            </div>
                        }
                    </div>
                </div>


                {middleware == "billing" && !!planData ?
                <div className="box billing channels-box">

                    <div className="col-md-12">
                        <h5>Select Your Billing Cycle</h5>
                    </div>
                    
                    <div className="plan-box col-md-6 col-xs-12">
                        <div className={`billingPeriodSelection col-md-12 ${this.state.billingPeriod === 'annually' && 'selected'}`}>

                            <label className="custom-radio-container">Annually
                                
                                <input type="radio" name="billingPeriod" checked={this.state.billingPeriod === "annually" ? "checked" : false} onChange={() => this.setBillingPeriod("annually")}/>
                            
                                <span className="checkmark"></span>
                            </label>

                            <p>${parseFloat(planData["Annual Billing"] / 12).toFixed(1)} / month</p>
                            <p>Billing annually for ${parseFloat(planData["Annual Billing"]).toFixed(1)}</p>
                        </div>
                    </div>
                    <div className="plan-box col-md-6 col-xs-12">
                        <div className={`billingPeriodSelection col-md-12 ${this.state.billingPeriod === 'monthly' && 'selected'}`}>

                            <label className="custom-radio-container">Monthly
                                
                                <input type="radio" name="billingPeriod" checked={this.state.billingPeriod === "monthly" ? "checked" : false} onChange={() => this.setBillingPeriod("monthly")}/>
                            
                                <span className="checkmark"></span>
                            </label>

                            <p>${parseFloat(planData["Monthly"]).toFixed(1)} / month</p>
                            <p>Billing monthly for ${parseFloat(planData["Monthly"]).toFixed(1)}</p> 
                        </div>
                    </div>

                    {!!planData && 
                    <Checkout 
                        plan={planName} 
                        subType="main" 
                        trialDays={30} 
                        setLoading={this.setLoading} 
                        setProfile={this.props.startSetProfile} 
                        text="">
                        <button className="magento-btn mt50">Proceed to Checkout</button>    
                    </Checkout>}
                    
                </div>
                : this.state.loading && <LoaderWithOverlay />
                }

                {middleware == "billing" && addon ?
                <div className="box billing channels-box">

                    <div className="col-md-12">
                        <h5>Twitter Growth</h5>
                    </div>
                    <div className="plan-box col-md-12 col-xs-12">
                        <div className={`billingPeriodSelection col-md-12 ${this.state.billingPeriod === 'monthly' && 'selected'}`}>

                            <label className="custom-radio-container">{`${!!addonTrial ? 'Free trial period of 3 days' : 'Monthly'}`}
                                
                                <input type="radio" name="billingPeriod" checked={true} onChange={() => this.setBillingPeriod("monthly")}/>
                            
                                <span className="checkmark"></span>
                            </label>

                            <p>{`${!!addonTrial ? '3 days free trial' : '$10.0 / month'}`}</p>
                            <p>Billing monthly for {!!addonTrial ? '$0.0 (3 days free trial)' : '$10.0'}</p> 
                        </div>
                    </div>

                    {!!addon && !(!!addonTrial) ? 
                        <Checkout 
                            plan="twitter_growth" 
                            subType="addon" 
                            trialDays={3} 
                            setLoading={this.setLoading} 
                            setProfile={this.props.startSetProfile} 
                            text="">
                            <button className="magento-btn mt50">Proceed to Checkout</button>    
                        </Checkout> : <button className="magento-btn mt50" onClick={this.setRole}>Continue</button>  

                    }
                </div> : this.state.loading && <LoaderWithOverlay />

                }


                <div className="col-md-5 middleware-side"></div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const filter = { selected: 1, provider: undefined };
    const selectedChannel = channelSelector(state.channels.list, filter);

    return {
        middleware: state.middleware.step,
        middlewareHashtags: state.middleware.stepHashtags,
        middlewareSuggested: state.middleware.stepSuggested,
        channels: state.channels.list,
        profile: state.profile,
        selectedChannel
    }
};

const mapDispatchToProps = (dispatch) => ({
    setMiddleware: (middleware) => dispatch(setMiddleware(middleware)),
    setHashtags: (middlewareHashtags) => dispatch(setHashtags(middlewareHashtags)),
    setConnects: (middlewareSuggested) => dispatch(setConnects(middlewareSuggested)),
    startSetChannels: () => dispatch(startSetChannels()),
    startAddTwitterChannel: (token, secret) => dispatch(startAddTwitterChannel(token, secret)),
    startSetProfile: () => dispatch(startSetProfile())
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Middleware));