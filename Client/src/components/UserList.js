import React from 'react';
import Popup from "reactjs-popup";
import SweetAlert from 'sweetalert2-react';
import { ToastContainer } from "react-toastr";
import Loader from '../components/Loader';
import AccountTargetSearchList from './TwitterBooster/AccountTargetSearchList';
import KeywordTargetSearchList from './TwitterBooster/KeywordTargetSearchList';
import { abbrNum } from "../utils/numberFormatter";
import { tweet, dm } from "../requests/twitter/channels";
import SocialAccountsPrompt from "./SocialAccountsPrompt";
import DraftEditor from "./DraftEditor";

let toastContainer;

class UserList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            error: {
                statusText: "",
                message: ""
            },
            userItems: props.userItem,
            loading: true
        };
    }

    perform = (username) => {
        return this.props.perform(username)
            .then((response) => {
                return Promise.resolve(response);
            })
            .catch((error) => {
                this.setState(() => ({
                    error: {
                        statusText: error.response.statusText,
                        message: error.response.data.message
                    }
                }));

                return Promise.reject(error);
            });
    };

    reply = (content) => {
        return tweet(content)
            .then((response) => {
                toastContainer.success("Reply posted successfully.", "Success", { closeButton: true });
                return Promise.resolve(response)
            })
            .catch((error) => {

                if (typeof error.response.statusText == "undefined") {
                    console.log(error);
                    return;
                }

                this.setState(() => ({
                    error: {
                        statusText: error.response.statusText,
                        message: error.response.data.message
                    }
                }));
                Promise.reject(error);
            });
    };

    dm = (content, userId) => {
        return dm(content, userId)
            .then((response) => {
                toastContainer.success("DM posted successfully.", "Success", { closeButton: true });
                return Promise.resolve(response)
            })
            .catch((error) => {

                if (typeof error.response.statusText == "undefined") {
                    console.log(error);
                    return;
                }

                this.setState(() => ({
                    error: {
                        statusText: error.response.statusText,
                        message: error.response.data.message
                    }
                }));
                Promise.reject(error);
            });
    };


    render() {
        const {
            userItems = [],
            loading = false,
            showTargetLink = false,
            searchView = false,
            showSearchView = (searchView = false) => { },
            reloadTargets = () => { },
            targetType = "account",
            targets = [],
            page,
            noData
        } = this.props;

        const targetSearchView = (
            (targetType == "account" ?
                <AccountTargetSearchList
                    targets={targets}
                    showSearchView={showSearchView}
                    reloadTargets={reloadTargets}
                />
                :
                <KeywordTargetSearchList
                    targets={targets}
                    showSearchView={showSearchView}
                    reloadTargets={reloadTargets}
                />
            )
        );
        return (
            <div>
                <ToastContainer
                    ref={ref => toastContainer = ref}
                    className="toast-top-right"
                />

                <SweetAlert
                    show={!!this.state.error.message}
                    title={this.state.error.statusText}
                    text={this.state.error.message}
                    onConfirm={() => this.setState({ error: { statusText: "", message: "" } })}
                />

                {userItems.length < 1 ?
                    (loading ? <Loader />
                        :
                        (showTargetLink ?
                            targetSearchView
                            :
                            <SocialAccountsPrompt
                                image="/images/no-data.svg"
                                title={noData.title}
                                description={noData.description}
                            />
                        )
                    ) :

                    (searchView ?
                        targetSearchView
                        :
                        <div>
                            <div className="row">
                                <div className="col-xs-12">
                                    <div className="item-list shadow-box">

                                        {userItems.map((item, index) => (
                                            <UserItem key={item.id}
                                                index={index}
                                                userItem={item}
                                                perform={this.perform}
                                                reply={this.reply}
                                                dm={this.dm}
                                                actionType={this.props.actionType}
                                                page={page}
                                            />
                                        ))}

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
}

const ListActions = ({ actionType, actions }) => (
    <div className="action-count pull-right">
        <p><span className="action-count-title">{actionType}s</span> : <span className={`${actionType}-count daily-actions`}>{actions}</span></p>
    </div>
);

const TargetsLink = ({ targetType, showSearchView }) => (
    <div className="pull-left">
        Showing list of accounts based on your <button className="btn btn-link zero-padding" onClick={() => showSearchView(true)}>{targetType} targets <i className="fa fa-pencil"></i></button>
    </div>
);


const SortOption = ({ sortBy }) => (
    <div className="pull-right form-inline sort-options">
        <label className="sortLabel" htmlFor="sort">Sort by: </label>

        <form className="form-group" id="order_form">
            <select onChange={(e) => sortBy(e.target.value)} name="order" id="order">
                <option value="desc" defaultValue >Newest First</option>
                <option value="asc">Oldest First</option>
            </select>
        </form>

    </div>
);

class UserItem extends React.Component {

    actionButton = this.props.actionType === "follow" ? "add" : "sub";
    defaultActionSymbol = this.actionButton === "add" ? "fa-plus-circle" : "fa-minus-circle";
    successActionSymbol = "fa-check";
    loadingActionSymbol = "fa-circle-o-notch fa-spin";

    state = {
        buttonState: {
            actionSymbol: this.defaultActionSymbol,
            action: this.actionButton,
            disabled: false
        },
        replyState: {
            content: '',
            disabled: true,
            letterCount: 280 - (this.props.userItem.screen_name.length + 2),
            loading: false
        },
        DMState: {
            content: '',
            disabled: true,
            letterCount: 10000,
            loading: false
        }
    }

    perform = () => {

        if (!this.state.buttonState.disabled) {

            let buttonState = Object.assign({}, this.state.buttonState);
            buttonState.disabled = true;
            buttonState.actionSymbol = this.loadingActionSymbol;

            this.setState(() => ({
                ...this.state,
                buttonState
            }));

            this.props.perform(this.props.userItem.screen_name)
                .then((response) => {
                    buttonState.disabled = true;
                    buttonState.actionSymbol = this.successActionSymbol;

                    this.setState(() => ({
                        buttonState
                    }));

                    return Promise.resolve(response);
                })
                .catch((error) => {
                    buttonState.disabled = false;
                    buttonState.actionSymbol = this.defaultActionSymbol;

                    this.setState(() => ({
                        buttonState,
                    }));

                    return Promise.reject(error);
                });
        }
    };

    reply = () => {
        this.setReplyState({ loading: true });
        this.props.reply(this.state.replyState.content)
            .then((response) => {
                this.setReplyState({ disabled: true, loading: false });
                return Promise.resolve(response);
            })
            .catch((error) => {
                this.setReplyState({ loading: false });
                return Promise.reject(error);
            });
    };

    dm = (screenName) => {
        this.setDMState({ loading: true });
        this.props.dm(this.state.DMState.content, screenName)
            .then((response) => {
                this.setDMState({ disabled: true, loading: false });
                return Promise.resolve(response);
            })
            .catch((error) => {
                this.setDMState({ loading: false });
                return Promise.reject(error);
            });
    };

    setReplyState = (replyState) => {
        this.setState((prevState) => ({
            ...this.state,
            replyState: {
                ...this.state.replyState,
                letterCount: prevState.replyState.disabled ? 280 - (this.props.userItem.screen_name.length + 2) : replyState.letterCount,
                ...replyState
            },
            DMState: {
                ...this.state.DMState,
                disabled: true
            }
        }));
    };

    setDMState = (DMState) => {

        this.setState((prevState) => ({
            ...this.state,
            DMState: {
                ...this.state.DMState,
                letterCount: DMState.letterCount,
                ...DMState
            },
            replyState: {
                ...this.state.replyState,
                disabled: true
            }
        }));
    };

    updateDMState = (content = "") => {
        this.setDMState({ letterCount: 10000 - content.length, content })
    };

    updateReplyState = (content = "") => {
        this.setReplyState({ letterCount: 280 - content.length, content })
    };

    render() {
        const { userItem, page } = this.props;
        const { buttonState, replyState, DMState } = this.state;

        return (
            <div>
                <div className={`item-row ${buttonState.disabled && 'disabled-btn'} clearfix`}>

                    <div>
                        <div className="profile-info">
                            <div className="user-info">
                                <img src={userItem.profile_image_url} />
                                <div>
                                    <p className="profile-name">{userItem.name}  <span className="profile-state"></span></p>
                                    <p className="profile-username">@{userItem.screen_name}</p>
                                    <p className="profile-title" title={userItem.description}>{userItem.description}</p>
                                </div>
                            </div>

                            <ul className="stats-info">
                                <li><p className="stat-count">{abbrNum(userItem.statuses_count, 1)}</p> <p className="stat-name">tweets</p></li>
                                <li><p className="stat-count">{abbrNum(userItem.followers_count, 1)}</p><p className="stat-name">followers</p></li>
                                <li><p className="stat-count">{abbrNum(userItem.friends_count, 1)}</p><p className="stat-name">following</p></li>
                            </ul>

                            <UserActionButtons
                                actionButton={buttonState}
                                perform={this.perform}
                                userItem={userItem}
                                replyState={replyState}
                                setReplyState={this.setReplyState}
                                DMState={DMState}
                                setDMState={this.setDMState}
                                page={page}
                            />
                        </div>

                    </div>
                </div>

                {!this.state.replyState.disabled &&
                    <div className={`item-row editor-container ${buttonState.disabled && 'disabled-btn'} clearfix`}>
                        <div className="reply-box">
                            <h2>Send a reply to @{userItem.screen_name}</h2>
                            <DraftEditor
                                onChange={this.updateReplyState}
                                content={this.state.replyState.content}
                                pictures={[]}
                                showImagesIcon={false}
                                showHashtagsIcon={false}
                                inclisive={true}
                                sendAction={this.reply}
                            />
                        </div>
                    </div>
                }

                {!this.state.DMState.disabled &&
                    <div className={`item-row editor-container ${buttonState.disabled && 'disabled-btn'} clearfix`}>
                        <div className="reply-box">
                            <h2>Send a direct message to @{userItem.screen_name}</h2>
                            <DraftEditor
                                onChange={this.updateDMState}
                                content={this.state.DMState.content}
                                pictures={[]}
                                showImagesIcon={false}
                                showHashtagsIcon={false}
                                inclisive={true}
                                sendAction={() => this.dm(userItem.id_str)}
                            />
                        </div>
                    </div>
                }
            </div>

        );
    }
}

const UserActionButtons = ({ actionButton, perform, replyState, setReplyState, setDMState, DMState, userItem, page }) => (
    <div className="item-actions pull-right">

        {(actionButton.action == "add" || page == "following") && <img className="user-action" src={`/images/reply-regular.svg`} onClick={() => { setReplyState({ disabled: !replyState.disabled, content: `@${userItem.screen_name} ` }); }} />}
        {(actionButton.action == "add" || page == "following") && <img className="user-action" src={`/images/envelope-regular.svg`} onClick={() => { setDMState({ disabled: !DMState.disabled, content: `` }); }} />}
        {!!actionButton &&
            actionButton.action == "add" ?
            <img onClick={() => { perform(); }} src={`/images/user-plus-regular.svg`} className={`user-action ${actionButton.disabled ? 'disabled-btn' : ''}`} />
            :
            <img onClick={() => { perform(); }} src={`/images/user-minus-regular.svg`} className={`user-action ${actionButton.disabled ? 'disabled-btn' : ''}`} />
        }
    </div>
);

export default UserList;