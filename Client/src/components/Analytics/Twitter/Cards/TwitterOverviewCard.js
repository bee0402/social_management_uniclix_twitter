import React from 'react';
import Loader from 'react-loader-spinner';
import {NavLink} from "react-router-dom";
import { pageInsightsByType } from "../../../../requests/twitter/channels";

class TwitterOverviewCard extends React.Component {
    state = {
        count: null,
        countAll: null,
        tweetsCount: "",
        weeklyAnalytics: null,
        loading: false
    };

    componentDidMount() {
        this.fetchAnalytics();
        this.fetchAllAnalytics();
    };

    componentDidUpdate(prevProps) {
        if (prevProps.selectedAccount != this.props.selectedAccount || prevProps.calendarChange != this.props.calendarChange) {
            this.fetchAnalytics();
            this.fetchAllAnalytics();
        }
    }
    cardWeekly = (type, count) => {
        if (type == "tweetsCount") {
            this.setState({ tweetsCount: "<span>" + count + " new trending topics</span> in your area" });
        } else if (type == "followersCount") {
            this.setState({ tweetsCount: "<span>" + count + " new users</span> to follow" });
        } else if (type == "followingCount") {
            this.setState({ tweetsCount: "<span>" + count + " inactive users</span> to clean up" });
        }

    }
    fetchAnalytics = () => {
        const { selectedAccount, startDate = null, endDate = null, type } = this.props
        try {
            pageInsightsByType(selectedAccount, startDate, endDate, type)
                .then((response) => {
                    this.setState({
                        count: response,
                    });
                    let description = "";
                    if (type == "tweetsCount") {
                        description = <div className="analytics-description clearfix"><span> {response} new trending topics</span> in your area"</div>;
                    } else if (type == "followersCount") {
                        description = <div className="analytics-description clearfix"><span> {response} new users</span> to follow</div>;
                    } else if (type == "followingCount") {
                        description = <div className="analytics-description clearfix"><span> {response} inactive users</span> to clean up</div>;
                    }
                    this.setState({ tweetsCount: description });
                }).catch(error => {
                    if (error.response.status === 403) {
                        this.props.setForbidden(true);
                    }

                    return Promise.reject(error);
                });
        } catch (error) {

        }
    };
    fetchAllAnalytics = () => {
        this.setState(() => ({
            loading: true
        }));
        try {
            pageInsightsByType(this.props.selectedAccount, null, null, this.props.type)
                .then((response) => {
                    this.setState(() => ({
                        countAll: response,
                        loading: false
                    }));
                }).catch(error => {
                    this.setState(() => ({
                        loading: false
                    }));

                    if (error.response.status === 403) {
                        this.props.setForbidden(true);
                    }

                    return Promise.reject(error);
                });
        } catch (error) {

        }
    };
    render() {
        const { name, iconPath, link } = this.props;

        return (
            <div className="overview-card analytics-card">
                <div className="analytic-card-body">
                    <div className="analytic-column col-md-6">
                        <div className="analytic-stats">
                            {
                                iconPath ? <img src={iconPath} /> :
                                    <img className="card-img" src="/images/twitter.png" />
                            }
                            <div className="analytic-stat-count">
                                {this.state.loading ?
                                    <Loader type="Bars" color="#46a5d1" height={30} width={30} /> :
                                    this.state.countAll != null && this.state.countAll}
                            </div>
                        </div>
                        <p>{name}</p>
                    </div>


                    <div className="analytic-column col-md-6">
                        <div>
                            <img src={`/images/stat-line.svg`} />
                        </div>

                        <p><span>+12</span> this week</p>
                    </div>
                    <NavLink to={link}>
                        {this.state.tweetsCount}
                    </NavLink>
                </div>
            </div>
        );
    }
}

export default TwitterOverviewCard;