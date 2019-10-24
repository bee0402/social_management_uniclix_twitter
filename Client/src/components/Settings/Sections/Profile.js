import React from 'react';
import { connect } from "react-redux";
import Modal from "react-modal";
import GeoSuggest from "react-geosuggest";
import { updateProfile } from "../../../requests/profile";
import momentTz from "moment-timezone";
import TimezoneSelectOptions from '../Fixtures/TimezoneOptions';
import { validateEmail, validateUrl } from "../../../utils/validator";
import { startSetProfile } from "../../../actions/profile";
import { LoaderWithOverlay } from "../../Loader";

class Profile extends React.Component {

    state = {
        name: "",
        email: "",
        website: "",
        organizationName: "",
        reason: "",
        topics: [],
        topic: "",
        locations: [],
        location: "",
        timezone: "",
        isTopicsModalOpen: false,
        isLocationsModalOpen: false,
        error: false,
        success: false,
        loading: false,
        isTabActive: 'personal-info'
    };

    componentDidMount() {
        this.initializeProfileData();
    }

    initializeProfileData = () => {
        if (this.props.profile) {
            const user = this.props.profile.user;
            const topics = this.props.profile.topics;
            const locations = this.props.profile.locations;

            let stateCopy = Object.assign({}, this.state);
            stateCopy["name"] = user.name ? user.name : "";
            stateCopy["email"] = user.email ? user.email : "";
            stateCopy["website"] = user.website ? user.website : "";
            stateCopy["organizationName"] = user.organization_name ? user.organization_name : "";
            stateCopy["reason"] = user.usage_reason ? user.usage_reason : "Myself";
            stateCopy["topics"] = topics.map((topic) => topic.topic);
            stateCopy["locations"] = locations.map((location) => {
                if (location) {
                    location = JSON.parse(location.location);
                    return location;
                }
            });

            stateCopy["timezone"] = user.timezone ? user.timezone : momentTz.tz.guess();

            this.setState(() => (stateCopy));
        }
    };

    toggleTopicsModal = (e) => {
        e.preventDefault();
        this.setState(() => ({
            isTopicsModalOpen: !this.state.isTopicsModalOpen
        }));
    };

    onTopicsFieldChange = (topic) => {
        this.setState(() => ({
            topic
        }));
    };

    onLocationsFieldChange = (location) => {
        console.log(location);
        this.setState(() => ({
            location
        }));
    };

    onFieldChange = (e) => {
        const id = e.target.id;
        let state = Object.assign({}, this.state);
        state[id] = e.target.value;
        this.setState(() => (state));
    };

    onSubmit = (e) => {
        e.preventDefault();

        this.setState(() => ({
            error: false
        }));

        if (!validateEmail(this.state.email) || this.state.email === "") {
            this.setState(() => ({
                error: "Please fix the email!",
                loading: false
            }));

            return;
        }

        if (this.state.website !== "" && !validateUrl(this.state.website)) {
            this.setState(() => ({
                error: "Please fix the website url!",
                loading: false
            }));

            return;
        }

        if (this.state.name === "") {
            this.setState(() => ({
                error: "Name can't be empty!",
                loading: false
            }));

            return;
        }

        this.setState(() => ({
            loading: true
        }));

        updateProfile({
            name: this.state.name,
            email: this.state.email,
            website: this.state.website,
            organization_name: this.state.organizationName,
            topics: this.state.topics,
            locations: this.state.locations,
            timezone: this.state.timezone,
            reason: this.state.reason
        }).then((response) => {
            this.props.startSetProfile();
            this.setState(() => ({
                success: "Your profile information has been updated.",
                loading: false
            }));
        }).catch((error) => {
            console.log(error);
            this.setState(() => ({
                error: "Something went wrong.",
                loading: false
            }));
        });
    };

    toggleLocationsModal = (e) => {
        e.preventDefault();
        this.setState(() => ({
            isLocationsModalOpen: !this.state.isLocationsModalOpen
        }));
    };

    addTopic = (e) => {
        e.preventDefault();
        if (this.state.topic) {
            this.setState((prevState) => {
                return {
                    topics: [
                        ...prevState.topics.filter(topic => topic !== prevState.topic),
                        prevState.topic
                    ],
                    topic: ""
                }
            });
        }
    };

    addLocation = (e) => {
        e.preventDefault();
        if (this.state.location) {
            this.setState((prevState) => {
                return {
                    locations: [
                        ...prevState.locations.filter(location => JSON.stringify(location) !== JSON.stringify(prevState.location)),
                        prevState.location
                    ],
                    location: ""
                }
            });
        }
    };

    removeTopic = (index) => {
        let topics = [...this.state.topics];
        topics.splice(index, 1);

        this.setState(() => ({
            topics
        }));
    };

    removeLocation = (index) => {
        let locations = [...this.state.locations];
        locations.splice(index, 1);

        this.setState(() => ({
            locations
        }));
    };

    ChangeTab = (newIndex) => {
        this.setState(() => ({
            isTabActive: newIndex
        }));
    }
    setLocation = (location) => {
        console.log(location);
        this.state.locations.map(location => ` ${location.label}`)
    }

    render() {
        const { isTabActive, success, error, locations } = this.state;
        console.log(locations);
        return (
            <div>
                {this.state.loading && <LoaderWithOverlay />}
                <Modal
                    isOpen={this.state.isTopicsModalOpen}
                    ariaHideApp={false}
                    className="topicsModal"
                >
                    <form onSubmit={(e) => this.addTopic(e)}>
                        <h3>Add Topics</h3>
                        <div className="form-group flex_container-center">
                            <div>
                                {this.state.topics.length >= 15 ?
                                    <input disabled type="text" className="form-control" onChange={(e) => this.onTopicsFieldChange(e.target.value)} value={this.state.topic} placeholder="food, pets, fashion..." />
                                    :
                                    <input type="text" className="form-control" onChange={(e) => this.onTopicsFieldChange(e.target.value)} value={this.state.topic} placeholder="food, pets, fashion..." />
                                }

                            </div>
                        </div>
                    </form>


                    {!!this.state.topics.length && this.state.topics.map((topic, index) => (
                        <div key={index} className="addedItemLabels">{topic} <span className="fa fa-times link-cursor" onClick={() => this.removeTopic(index)}></span></div>
                    ))}

                    <div className="right-inline top-border p10 m10-top">
                        <button className="magento-btn small-btn" onClick={this.toggleTopicsModal}>Add</button>
                    </div>
                </Modal>


                <Modal
                    isOpen={this.state.isLocationsModalOpen}
                    ariaHideApp={false}
                    className="topicsModal"
                >
                    <form onSubmit={(e) => this.addLocation(e)}>
                        <h3>Add Locations</h3>
                        <div className="form-group flex_container-center">
                            <div>
                                <GeoSuggest
                                    onSuggestSelect={this.onLocationsFieldChange}
                                    initialValue={this.state.location && this.state.location.label}
                                    disabled={this.state.locations.length >= 5 ? true : false}
                                />
                            </div>
                        </div>
                    </form>


                    {!!this.state.locations.length && this.state.locations.map((location, index) => (
                        <div key={index} className="addedItemLabels">{location.label} <span className="fa fa-times link-cursor" onClick={() => this.removeLocation(index)}></span></div>
                    ))}

                    <div className="right-inline top-border p10 m10-top">
                        <button className="magento-btn small-btn" onClick={this.toggleLocationsModal}>Add</button>
                    </div>
                </Modal>
                <div className="section-header no-border">
                    <div className="section-header__first-row">
                        <h2>PROFILE</h2>
                    </div>
                </div>
                {this.state.error &&
                    <div className="alert alert-danger">{error}</div>
                }

                {this.state.success &&
                    <div className="alert alert-success">{success}</div>
                }
                <div className="tab-cnt">
                    <div className="tab-head">
                        <div className={`tab-nav-item ${isTabActive == 'personal-info' ? 'active' : ''}`}>
                            <button href="#personal-info" onClick={() => this.ChangeTab('personal-info')}>Personal information</button>
                        </div>
                        <div className={`tab-nav-item ${isTabActive == 'company-info' ? 'active' : ''}`}>
                            <button href="#company-info" onClick={() => this.ChangeTab('company-info')}>Company information</button>
                        </div>
                    </div>
                    <div className="tab-body">
                        <div className={`cnt-item ${isTabActive == 'personal-info' ? 'active' : ''}`}>
                            <form onSubmit={(e) => this.onSubmit(e)} className="profile-form">
                                <div className="form-group shadow-box main-content-style">

                                    <div className="column-container">
                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="name">Full Name</label>
                                            <input type="text" className="form-control whiteBg" onChange={(e) => this.onFieldChange(e)} id="name" value={this.state.name} placeholder="johndoe" />
                                        </div>

                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="name">Type</label>
                                            <select type="text" value={this.state.reason} onChange={(e) => this.onFieldChange(e)} className="form-control whiteBg" id="reason">
                                                <option>Myself</option>
                                                <option>My Business</option>
                                                <option>My Clients</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="email">Email addresse</label>
                                            <input type="email" className="form-control whiteBg" id="email" onChange={(e) => this.onFieldChange(e)} value={this.state.email} placeholder="johndoe@example.com" />
                                        </div>
                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="website">Website</label>
                                            <input type="text" className="form-control whiteBg" value={this.state.website} onChange={(e) => this.onFieldChange(e)} id="website" placeholder="www.example.com" />
                                        </div>

                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="name">I am using Uniclix for:</label>
                                            <select type="text" value={this.state.reason} onChange={(e) => this.onFieldChange(e)} className="form-control whiteBg" id="reason">
                                                <option>Myself</option>
                                                <option>My Business</option>
                                                <option>My Clients</option>
                                            </select>
                                        </div>
                                    </div>


                                    <div className="clearer form-field col-12 col-md-8  ">
                                        <label htmlFor="topics">My Topics</label>
                                        <div className="clearfix">
                                            <button href="javascript:void();" className="default-white-btn pull-right" onClick={this.toggleTopicsModal}><span className="cus-plus-icon">+</span>Add Topic</button>
                                        </div>
                                        {!!this.state.topics.length && this.state.topics.map((topic, index) => (
                                            <div key={index} className="addedItemLabels">{topic} <span className="fa fa-times link-cursor" onClick={() => this.removeTopic(index)}></span></div>
                                        ))}
                                        <input type="hidden" className="form-control whiteBg" id="topics" readOnly={true} onClick={this.toggleTopicsModal} value={this.state.topics.map(topic => ` ${topic}`)} placeholder="food, pets, fashion..." />
                                    </div>

                                    <div className="col-12 col-md-8">
                                        <button className="magento-btn pull-left">Save</button>
                                    </div>
                                </div>
                            </form>

                        </div >
                        <div className={`cnt-item ${isTabActive == 'company-info' ? 'active' : ''}`}>
                            <form onSubmit={(e) => this.onSubmit(e)} className="profile-form">


                                <div className="form-group shadow-box main-content-style">


                                    <div className="col-12 col-md-8 form-field">
                                        <label htmlFor="topics">Company Name</label>
                                        <input type="text" className="form-control whiteBg" id="organizationName" onChange={(e) => this.onFieldChange(e)} value={this.state.organizationName} placeholder="Company" />
                                    </div>
                                    <div className="col-12 col-md-8 form-field">
                                        <label htmlFor="website">Country</label>
                                        <GeoSuggest
                                            className="col-12"
                                            inputClassName="form-control whiteBg"
                                            placeholder="Write your country name"
                                            onSuggestSelect={this.onLocationsFieldChange}
                                            initialValue={this.state.location && this.state.location.label}
                                            disabled={this.state.locations.length >= 5 ? true : false}
                                        />
                                        <input type="hidden" id="website" readOnly={true} value={this.state.locations.map(location => ` ${location.label}`)} onClick={this.toggleLocationsModal} placeholder="New York City, Amsterdam, Venice..." />
                                    </div>

                                    <div className="col-12 col-md-8 form-field">
                                        <label htmlFor="topics">Addresse</label>
                                        <input type="text" className="form-control whiteBg" id="organizationName" onChange={(e) => this.onFieldChange(e)} value={this.state.organizationName} placeholder="Example: 22 E 22Th St, New York, NY 10033" />
                                    </div>
                                    <div className="col-12 col-md-8 form-field">
                                        <label htmlFor="topics">Company Email</label>
                                        <input type="email" className="form-control whiteBg" id="organizationName" onChange={(e) => this.onFieldChange(e)} value={this.state.organizationName} placeholder="info@uniclixapp.com" />
                                    </div>
                                    <div className="col-12 col-md-8 form-field">
                                        <label htmlFor="topics">Company Phone</label>
                                        <input type="tel" className="form-control whiteBg" id="organizationName" onChange={(e) => this.onFieldChange(e)} value={this.state.organizationName} placeholder="+1 603-278-1000" />
                                    </div>

                                    <div className="col-12 col-md-8">
                                        <button className="magento-btn pull-left">Save</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div >
                </div >
            </div >
        );
    }
}

const mapStateToProps = (state) => {
    return {
        profile: state.profile
    };
};

const mapDispatchToProps = (dispatch) => ({
    startSetProfile: () => dispatch(startSetProfile())
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);