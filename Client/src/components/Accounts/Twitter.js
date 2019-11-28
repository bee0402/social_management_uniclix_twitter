import React from 'react';
import { connect } from 'react-redux';
import TwitterLogin from 'react-twitter-auth';
import SweetAlert from "sweetalert2-react";
import { Prompt } from 'react-router';
import { withRouter } from "react-router";
import ChannelItems from "./ChannelItems";
import UpgradeAlert from "../UpgradeAlert";
import { startSetProfile } from "../../actions/profile";
import { startAddTwitterChannel, startSetChannels } from "../../actions/channels";
import { twitterRequestTokenUrl, twitterAccessTokenUrl } from "../../config/api";
import channelSelector from "../../selectors/channels";
import { destroyChannel } from "../../requests/channels";
import { cancelSubscription, resumeSubscription } from "../../requests/billing";
import { logout } from "../../actions/auth";
import Loader from "../../components/Loader";
import { updateSubscription } from '../../requests/billing';

class Twitter extends React.Component {
    constructor(props) {
        super(props);
    }

    defaultAction = {
        id: "",
        type: ""
    };

    state = {
        action: this.defaultAction,
        error: "",
        newAccounts: 0,
        loading: true,
        forbidden: false,
        actualUsers: 0,
        shouldBlockNavigation: false
    }

    setAction = (action = this.defaultAction) => {
        this.setState(() => ({
            action
        }));
    }

    componentDidMount() {
        this.accountsBilling();
    }

    accountsBilling = () => {
        this.setState({ loading: false })
        this.setState({
            newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length,
            actualUsers: (this.props.channels).filter(channel => channel.details.paid == 1).length
        })
    }

    componentDidUpdate = (prevProps) => {
        let addedNewUsers = false
        if ((this.props.channels !== prevProps.channels)) {
            addedNewUsers = this.state.actualUsers < this.props.channels.length;
            this.setState({
                newAccounts: this.props.channels.length - this.state.actualUsers
            })
            this.setState({
                shouldBlockNavigation: addedNewUsers
            })

            if (addedNewUsers) {
                window.onbeforeunload = true
            } else {
                window.onbeforeunload = undefined
            }
        }
    }

    onFailure = (response) => {
        console.log(response);
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

    onSuccess = (response) => {
        response.json().then(body => {
            this.props.startAddTwitterChannel(body.oauth_token, body.oauth_token_secret)
                .then(res => {
                    this.props.startSetChannels()
                        .then((response) => {
                            this.props.startSetProfile().then(res => {
                                this.setState({
                                    newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length,
                                    actualUsers: (this.props.channels).filter(channel => channel.details.paid == 1).length
                                });
                            });
                        })
                })
                .catch(error => {
                    console.log(error)
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
    };

    remove = (id) => {
        return destroyChannel(id)
            .then((response) => {

                this.setState({
                    action: this.defaultAction,
                })
                this.props.startSetChannels()
                    .then((response) => {
                        this.setState(() => ({
                            newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length,
                            actualUsers: (this.props.channels).filter(channel => channel.details.paid == 1).length
                        }));
                    });
            }).catch((e) => {
                if (typeof e.response !== "undefined" && typeof e.response.data.error !== "undefined") {
                    this.setState(() => ({
                        error: e.response.data.error
                    }));
                    return;
                }
            });
    }

    startCheckout = () => {
        this.setState({ shouldBlockNavigation: false })
        setTimeout(() => {
            this.props.history.push('/twitter-booster/checkout')
        }, 0)
    }

    updateCheckout = () => {
        this.setState({ shouldBlockNavigation: false });

        this.setState({
            loading: true
        });
        let token = {
            plan: "twitter-booster",
            trialDays: 0,
            subType: "main"
        }
        updateSubscription(token).then(response => {
            this.props.startSetChannels()
                .then((response) => {
                    this.props.startSetProfile().then(res => {
                        this.setState({
                            loading: false,
                            orderFinished: true,
                            newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length,
                            actualUsers: (this.props.channels).filter(channel => channel.details.paid == 1).length
                        });
                    });
                })
        }).catch(e => {
            console.log(e)
            this.setState({
                loading: false,
                message: ""
            });
        })

    }

    cancelSubscription = () => {
        this.setState({
            loading: true
        });
        return cancelSubscription()
            .then((response) => {
                this.props.startSetChannels()
                    .then((response) => {
                        this.props.startSetProfile().then(res => {
                            this.setState({
                                loading: false,
                                action: this.defaultAction,
                                newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length,
                                actualUsers: (this.props.channels).filter(channel => channel.details.paid == 1).length
                            });
                        });
                    });
            }).catch((e) => {
                if (typeof e.response !== "undefined" && typeof e.response.data.error !== "undefined") {
                    this.setState(() => ({
                        error: e.response.data.error,
                        loading: false,
                    }));
                    return;
                }
            });
    }

    resumeCheckout = () => {
        this.setState({
            loading: true
        });
        return resumeSubscription()
            .then((response) => {
                this.props.startSetChannels().then(res => {
                    this.props.startSetProfile().then(res => {
                        this.setState({
                            loading: false,
                            action: this.defaultAction,

                            newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length,
                            actualUsers: (this.props.channels).filter(channel => channel.details.paid == 1).length
                        });
                    });
                });
            }).catch((e) => {
                if (typeof e.response !== "undefined" && typeof e.response.data.error !== "undefined") {
                    this.setState(() => ({
                        error: e.response.data.error,
                        loading: false,
                    }));
                    return;
                }
            });
    }

    calcTrialDays = (user) => {
        let msDiff = new Date(user.trial_ends_at).getTime() - new Date().getTime();    //Future date - current date
        var daysToTheEnd = Math.floor(msDiff / (1000 * 60 * 60 * 24));
        return daysToTheEnd > 0 ? daysToTheEnd : 0
    }

    render() {
        const { shouldBlockNavigation, error, forbidden, action, newAccounts, actualUsers } = this.state
        const { profile, channels } = this.props
        return (
            <React.Fragment>
                <Prompt
                    when={shouldBlockNavigation}
                    message='If you leave the page without proceeding to checkout all the accounts you linked will be lost.'
                />
                <div className="main-container">
                    <UpgradeAlert
                        isOpen={forbidden}
                        text={"Your current plan does not support more accounts."}
                        setForbidden={this.setForbidden} />
                    <SweetAlert
                        show={!!action.id}
                        title={`Do you wish to ${action.type} this item?`}
                        text="To confirm your decision, please click one of the buttons below."
                        showCancelButton
                        type="warning"
                        confirmButtonText="Yes"
                        cancelButtonText="No"
                        onConfirm={() => {
                            if (action.type === 'delete') {
                                this.remove(action.id);
                            } else {
                                console.log('something went wrong');
                            }
                        }}
                    />

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

                    <div className="row">
                        <div className="col-md-6">
                            <div className="section-header no-border col-md-12">
                                <div className="section-header__first-row">
                                    <h2>Manage Accounts</h2>
                                </div>

                                <div className="section-header__second-row">
                                    <h3>Linked Accounts</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    {!!this.state.loading && <Loader />}

                    <div className="row mt20">
                        <div className="col-md-7">

                            <div className="col-md-12">
                                <ChannelItems channels={channels} setAction={this.setAction} />
                                {!!this.props.loading && <Loader />}

                                <div className="accounts-container__content__wrapper__footer">
                                    <TwitterLogin loginUrl={twitterAccessTokenUrl}
                                        onFailure={this.onFailure}
                                        onSuccess={this.onSuccess}
                                        requestTokenUrl={twitterRequestTokenUrl}
                                        showIcon={true}
                                        forceLogin={true}
                                        className="add-channel-plus-btn">
                                        <i className="fa fa-plus"></i>
                                    </TwitterLogin>
                                    <span className="left-side-label">Add account</span>
                                </div>
                            </div>

                        </div>
                        {!!profile.subscription ?
                            (!profile.subscription.activeSubscription ?
                                <div className="col-md-5">
                                    <div className="col-md-12 plan-info-container">
                                        <h3>Trial</h3>

                                        <div className="plan-content">
                                            <p className="plan-content-description">{this.calcTrialDays(profile.user)} days left trial</p>
                                            <p className="plan-content-accounts">x{channels.length} accounts</p>
                                        </div>

                                        <button className="btn-blue" onClick={() => { this.startCheckout() }}>Start subscription</button>
                                    </div>
                                </div>
                                :
                                <div className="col-md-5">
                                    <div className=" plan-info-container">
                                        <h3>My Plan
                                            {!profile.subscription.onGracePeriod &&
                                                <button
                                                    className="btn-text-pink"
                                                    onClick={() => this.cancelSubscription()}
                                                >Cancel subscription</button>
                                            }</h3>

                                        <div className="plan-content table">
                                            {actualUsers > 0 &&
                                                <div className="row-price">
                                                    <div className="col-price">
                                                        <p className="plan-content-description">Current price</p>
                                                        <p className="plan-content-accounts">x{actualUsers} accounts</p>
                                                    </div>
                                                    <div className="col-price">
                                                        <p className="price">${actualUsers * 10}</p>
                                                    </div>
                                                </div>
                                            }
                                            <br />
                                            {newAccounts > 0 &&
                                                <div className="row-price new-accounts">
                                                    <div className="col-price">
                                                        <p className="plan-content-accounts">x{newAccounts} accounts</p>
                                                    </div>
                                                    <div className="col-price">
                                                        <p className="price">${newAccounts * 10}</p>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <div className="order-total table">
                                            <div className="row-price">
                                                <div className="col-price">
                                                    <p className="plan-content-description">TOTAL</p>
                                                    <p className="plan-content-accounts">Monthly</p>
                                                </div>
                                                <div className="col-price">
                                                    <p className="price">${(newAccounts + actualUsers) * 10}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {newAccounts > 0 && !profile.subscription.onGracePeriod ?
                                            <button className="btn-blue" onClick={() => { this.updateCheckout() }}>Update subscription</button>
                                            : ""
                                        }
                                        {!!profile.subscription.onGracePeriod &&
                                            <button className="btn-blue" onClick={() => { this.resumeCheckout() }}>Resume subscription</button>
                                        }
                                    </div>
                                </div>
                            ) : ""
                        }
                    </div>
                </div>
            </React.Fragment>
        );
    };
}

const mapStateToProps = (state) => {

    const twitterChannelsFilter = { selected: undefined, provider: "twitter" };
    const channels = channelSelector(state.channels.list, twitterChannelsFilter);
    const profile = state.profile
    return {
        channels,
        profile,
        loading: state.channels.loading
    };
};

const mapDispatchToProps = (dispatch) => ({
    startAddTwitterChannel: (accessToken, accessTokenSecret) => dispatch(startAddTwitterChannel(accessToken, accessTokenSecret)),
    startSetChannels: () => dispatch(startSetChannels()),
    logout: () => dispatch(logout()),
    startSetProfile: () => dispatch(startSetProfile())
});


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Twitter));