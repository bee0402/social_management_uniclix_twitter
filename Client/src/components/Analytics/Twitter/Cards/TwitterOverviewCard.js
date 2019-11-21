import React from 'react';
import Loader from 'react-loader-spinner';
import { NavLink } from "react-router-dom";
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

    fetchAnalytics = () => {
        const { selectedAccount, type } = this.props

        let endDate = new Date().getTime();;
        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 7)
        let startDateInt = startDate.getTime();
        try {
            pageInsightsByType(selectedAccount, startDateInt, endDate, type)
                .then((response) => {
                    this.setState({
                        count: response,
                    });
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
        const { name, iconPath, link, description } = this.props;

        return (
            <div className="overview-card analytics-card">
                <div className="analytic-card-body">
                    <div className="analytic-column col-md-12">
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


                    {/* <div className="analytic-column col-md-6">
                        <div>
                            <img src={`/images/stat-line.svg`} />
                        </div>

                        <p><span>+{this.state.count}</span> this week</p>
                    </div> */}
                    <NavLink to={link}>
                        {description}
                    </NavLink>
                </div>
            </div>
        );
    }
}

export default TwitterOverviewCard;