import React from 'react';
import { connect } from "react-redux";
import {NavLink} from "react-router-dom";
import GeoSuggest from "react-geosuggest";
import { updateProfile } from "../../../requests/profile";
import momentTz from "moment-timezone";
import { validateEmail, validateUrl } from "../../../utils/validator";
import { getKeywordTargets } from '../../../requests/twitter/channels';
import { startSetProfile } from "../../../actions/profile";
import { LoaderWithOverlay } from "../../Loader";

class Profile extends React.Component {

    state = {
        name: "",
        email: "",
        website: "",
        type: "",
        organizationName: "",
        reason: "",
        topics: [],
        targets: [],
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
        this.fetchTargets();
    }
    fetchTargets = () => {
        getKeywordTargets()
            .then((response) => {
                if (typeof (response.items) === "undefined") return;

                this.setState(() => ({
                    targets: response.targets
                }));
            }).catch(error => {
                this.setLoading(false);

                if (error.response.status === 401) {

                    if (this.props.selectedChannel.active) {
                        this.props.startSetChannels();
                    }
                }

                if (error.response.status === 403) {
                    this.setForbidden(true);
                }

                return Promise.reject(error);
            });
    };

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

    onLocationsFieldChange = (location) => {
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


    ChangeTab = (newIndex) => {
        this.setState(() => ({
            isTabActive: newIndex
        }));
    }

    render() {
        const { isTabActive, success, error, locations, targets } = this.state;
        return (
            <div>
                {this.state.loading && <LoaderWithOverlay />}

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
                                            <select type="text" value={this.state.type} onChange={(e) => this.onFieldChange(e)} name="type" className="form-control whiteBg" id="type">
                                                <option>Choose type</option>
                                                <option value="Influencer / Non-business">Influencer / Non-business</option>
                                                <option value="Self-employed">Self-employed</option>
                                                <option value="Small or medium business (1-499 employees)">Small or medium business (1-499 employees)</option>
                                                <option value="Enterprise (500+ employees)">Enterprise (500+ employees)</option>
                                                <option value="NGO / Non-profit / Governmental organization">NGO / Non-profit / Governmental organization</option>
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="email">Email addresse</label>
                                            <input type="email" className="form-control whiteBg" id="email" onChange={(e) => this.onFieldChange(e)} value={this.state.email} placeholder="johndoe@example.com" />
                                        </div>
                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="website">Website</label>
                                            <input type="text" className="form-control whiteBg" value={this.state.website} onChange={(e) => this.onFieldChange(e)} name="website" id="website" placeholder="www.example.com" />
                                        </div>

                                        <div className="col-12 col-md-8 form-field">
                                            <label htmlFor="name">I am using Uniclix for:</label>
                                            <select type="text" value={this.state.reason} onChange={(e) => this.onFieldChange(e)} className="form-control whiteBg" name="reason" id="reason">
                                                <option>Myself</option>
                                                <option>My Business</option>
                                                <option>My Clients</option>
                                            </select>
                                        </div>

                                        <div className="clearer form-field col-12 col-md-8  ">
                                            <label htmlFor="topics">My Topics</label>
                                            <div className="clearfix text-right">
                                                <NavLink to="/twitter-booster/keyword-targets" className="default-white-btn pull-right">Edit hashtags</NavLink>
                                            </div>
                                            <div className="added-items">
                                                {targets.map((target, index) => (
                                                    <div className="keyword-item added-keyword" key={index}>#{target.keyword}</div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-8">
                                            <button className="magento-btn pull-left">Save</button>
                                        </div>
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
                                        <input type="text" className="form-control whiteBg" id="Addresse" name="addresse" onChange={(e) => this.onFieldChange(e)} value={this.state.addresse} placeholder="Example: 22 E 22Th St, New York, NY 10033" />
                                    </div>
                                    <div className="col-12 col-md-8 form-field">
                                        <label htmlFor="topics">Company Email</label>
                                        <input type="email" className="form-control whiteBg" id="companyEmail" name="companyEmail" onChange={(e) => this.onFieldChange(e)} value={this.state.companyEmail} placeholder="info@uniclixapp.com" />
                                    </div>
                                    <div className="col-12 col-md-8 form-field">
                                        <label htmlFor="topics">Company Phone</label>
                                        <input type="tel" className="form-control whiteBg" id="companyPhone" name="companyPhone" onChange={(e) => this.onFieldChange(e)} value={this.state.companyPhone} placeholder="+1 603-278-1000" />
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