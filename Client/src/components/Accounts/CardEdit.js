import React from 'react';
import { connect } from 'react-redux';
import { isValid } from 'cc-validate';
import Picker from 'react-month-picker'
import SweetAlert from "sweetalert2-react";
import { startSetProfile } from "../../actions/profile";
import { startAddTwitterChannel, startSetChannels } from "../../actions/channels";
import channelSelector from "../../selectors/channels";
import { logout } from "../../actions/auth";
import { LoaderWithOverlay } from "../Loader";
import UpgradeAlert from "../UpgradeAlert";
import CongratsPayment from "./CongratsPayment";
import { updateCard } from '../../requests/billing';
import { stripePublishableKey } from '../../config/api';
import Countries from "../../fixtures/country";
import { getKeywordTargets } from '../../requests/twitter/channels';

class CardEdit extends React.Component {
    constructor(props) {
        super(props);
    }

    defaultAction = {
        id: "",
        type: ""
    };

    state = {
        action: this.defaultAction,
        countries: [],
        error: "",
        forbidden: false,
        validClaas: "",
        openCountry: false,
        locations: [],
        location: "",
        years: [],
        loading: false,
        validClaasCvv: "",
        shouldBlockNavigation: true,
        newAccounts: 0,
        actualUsers: 0,
        form: {
            cardnumber: '',
            cvc: '',
            exp_month: '',
            exp_year: '',
            exp_date: '',
            first_name: '',
            last_name: '',
            address_line1: '',
            address_city: '',
            location: '',
            address_zip: ''
        }
    }

    fetchTargets = () => {
        getKeywordTargets()
            .then((response) => {
                if (typeof (response.items) === "undefined") return;

                this.setState(() => ({
                    countries: Countries
                }));
            }).catch(error => {
                this.setLoading(false);

                if (error.response.status === 401) {

                }

                if (error.response.status === 403) {
                    this.setForbidden(true);
                }

                return Promise.reject(error);
            });
    };

    initializeCardData = () => {
        if (this.props.profile) {
            const user = this.props.profile.user.user_card_data;
            if (user) {
                let stateCopy = Object.assign({}, this.state);
                stateCopy["location"] = user.location ? user.location : "";
                stateCopy["form"]["address_city"] = user.address_city ? user.address_city : "";
                stateCopy["form"]["address_line1"] = user.address_line1 ? user.address_line1 : "";
                stateCopy["form"]["address_zip"] = user.address_zip ? user.address_zip : "";
                stateCopy["form"]["first_name"] = user.first_name ? user.first_name : "";
                stateCopy["form"]["last_name"] = user.last_name ? user.last_name : "";
                this.setState(() => (stateCopy));
            }
        }
    };
    handleAMonthChange = (value, text) => {
        let valueTxt = text + " / " + value

        this.setState({
            form: {
                ...this.state.form,
                exp_date: valueTxt || 'N/A',
                exp_month: text,
                exp_year: value
            }
        })
    }

    componentDidMount() {
        this.initializeCardData();
        this.activeYears();
        this.loadStripe();
        // this.accountsBilling();
        this.fetchTargets();
    }
    setLocation = (val) => {
        this.setState({ location: val, openCountry: false })
    }

    filterCountry = (e) => {
        let val = e.target.value;
        let countries = Countries.filter(item => item.toLowerCase().includes(val.toLowerCase()))

        this.setState({
            countries: countries,
            location: val
        })
    }

    accountsBilling = () => {
        this.setState({ loading: true })
        this.setState({
            newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length,
            actualUsers: (this.props.channels).filter(channel => channel.details.paid == 1).length
        })
    }
    loadStripe = () => {
        if (!window.document.getElementById('stripe-script')) {
            var s = window.document.createElement("script");
            s.id = "stripe-script";
            s.type = "text/javascript";
            s.src = "https://js.stripe.com/v2/";
            s.onload = () => {
                window['Stripe'].setPublishableKey(stripePublishableKey);
            }
            window.document.body.appendChild(s);
        }
    }

    checkIfValidCC = (val) => {
        let patern = new RegExp("^[0-9_ ]*$");
        if (patern.test(val) && val.length < 20) {
            let newval = '';
            val = val.replace(/\s/g, '');
            for (var i = 0; i < val.length; i++) {
                if (i % 4 == 0 && i > 0)
                    newval = newval.concat(' ');
                newval = newval.concat(val[i]);
            }

            this.setState({
                form: {
                    ...this.state.form,
                    cardnumber: newval
                }
            })
            let result = isValid(newval);
            this.setState({
                validClaas: result.isValid ? '' : "error"
            })
        }
    }

    beforeunload = (e) => {
        if (this.props.dataUnsaved) {
            e.preventDefault();
            e.returnValue = true;
        }
    }

    ValidateCvv = (e) => {
        let value = e.target.value;
        let cvv = value * 1;
        if (!isNaN(cvv) && value.length < 5) {
            var myRe = /^[0-9]{3,4}?$/;
            var myArray = myRe.exec(cvv);
            this.setState({
                validClaasCvv: cvv != myArray ? '' : "error",
                form: {
                    ...this.state.form,
                    cvc: value
                }
            })
        }

    }
    onFieldChange = (e) => {
        const id = e.target.name;
        let form = Object.assign({}, this.state.form);
        form[id] = e.target.value;
        this.setState({
            form: {
                ...form
            }
        })
    };

    activeYears = () => {
        const todayDate = new Date();
        const year = todayDate.getFullYear();
        let activeYears = []
        for (let y = 1; y < 11; y++) {
            activeYears.push(year + y)
        }
        this.setState({
            years: activeYears,
            loading: true
        })
    }

    handleClickMonthBox = (e) => {
        this.refs.pickAMonth.show()
    }
    handleClickMonthBoxHidde = (e) => {
        this.refs.pickAMonth.hidde()
    }

    ConfirmOrder = (e) => {
        e.preventDefault();

        this.setState({
            loading: false
        });

        window.Stripe.card.createToken({
            number: this.state.form.cardnumber,
            exp_month: this.state.form.exp_month,
            exp_year: this.state.form.exp_year,
            cvc: this.state.form.cvc,
            address_city: this.state.form.address_city,
            address_zip: this.state.form.address_zip,
            address_line1: this.state.form.address_line1
        }, (status, response) => {

            if (status === 200) {
                this.onToken(response)
            } else {
                this.setState({
                    loading: true,
                    message: ""
                });
            }
        });
    }

    onToken = (token) => {
        let card_data = {
            address_city: this.state.form.address_city,
            address_zip: this.state.form.address_zip,
            address_line1: this.state.form.address_line1,
            first_name: this.state.form.first_name,
            last_name: this.state.form.last_name,
            location: this.state.location
        }
        token.user_card_data = card_data;
        updateCard(token).then(response => {
            if (response.success) {
                this.props.startSetChannels().then(res => {
                    this.props.startSetProfile().then(res => {
                        this.setState({
                            loading: true,
                            orderFinished: true
                        });
                    });
                })
                setTimeout(() => {
                    this.props.history.push('/twitter-booster/manage-accounts')
                }, 0)
            }
        }).catch(e => {
            console.log(e)
            this.setState({
                loading: true,
                message: ""
            });
        })
    }

    render() {
        const { validClaas, form, years, loading, orderFinished, countries, newAccounts, actualUsers, openCountry, location } = this.state
        const items = countries.map((item,index) => {
            return <li key={index} onClick={() => this.setLocation(item)}> {item} </li>;
        });
        const todayDate = new Date();
        const minumumYear = todayDate.getFullYear();
        const minumumMonth = todayDate.getMonth();
        let pickerLang = {
            months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
            , from: 'From', to: 'To'
        }
            , mvalue = { year: minumumYear, month: minumumMonth + 1 }

        return (
            <div className="main-container">
                {!loading ? <LoaderWithOverlay /> :
                    <div>
                        {orderFinished ?
                            <CongratsPayment /> :
                            <div>
                                <UpgradeAlert isOpen={this.state.forbidden} text={"Your current plan does not support more accounts."} setForbidden={this.setForbidden} />
                                <SweetAlert
                                    show={!!this.state.error}
                                    title={`Error`}
                                    text={this.state.error}
                                    type="error"
                                    confirmButtonText="Ok"
                                    cancelButtonText="No"
                                    onConfirm={() => {
                                        this.setError("");
                                    }}
                                />

                                <div className="row ">
                                    <div className="col-md-7">

                                        <div className="section-header__second-row">
                                            <h3>Payment details</h3>
                                        </div>
                                        <div className="card-inputs form-field row">
                                            <div className="col-12 col-md-6">
                                                <input className={'form-control whiteBg ' + validClaas}
                                                    onChange={(e) => this.checkIfValidCC(e.target.value)}
                                                    type="tel"
                                                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                                    size="19"
                                                    maxLength="19"
                                                    value={form.cardnumber} placeholder="Card number" />
                                            </div>
                                            <div className="col-12 col-md-3">
                                                <Picker
                                                    ref="pickAMonth"
                                                    years={years}
                                                    value={mvalue}
                                                    lang={pickerLang.months}
                                                    onChange={this.handleAMonthChange}
                                                    onDismiss={this.handleAMonthDissmis}
                                                >
                                                    <input className="form-control whiteBg"
                                                        type="tel"
                                                        onChange={(e) => this.onDateChange(e)}
                                                        value={form.exp_date}
                                                        onClick={this.handleClickMonthBox}
                                                        onFocus={this.handleClickMonthBox}
                                                        onBlur={this.handleClickMonthBoxHidde}
                                                        name="exp_date"
                                                        autoComplete={"off"}
                                                        autoComplete="new-password"
                                                        maxLength="9"
                                                        placeholder="MM/DD" />
                                                </Picker>
                                            </div>
                                            <div className="col-12 col-md-3">
                                                <input className="form-control whiteBg"
                                                    onChange={(e) => this.ValidateCvv(e)}
                                                    value={form.cvc}
                                                    name="cvc"
                                                    placeholder="CVV" />
                                            </div>
                                        </div>

                                        <div className="section-header__second-row">
                                            <h3>Billing information</h3>
                                        </div>
                                        <div className="row">
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <input className={'form-control whiteBg '}
                                                    onChange={(e) => this.onFieldChange(e)}
                                                    value={form.first_name}
                                                    name="first_name"
                                                    placeholder="Name" />
                                            </div>
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <input className={'form-control whiteBg '}
                                                    onChange={(e) => this.onFieldChange(e)}
                                                    value={form.last_name}
                                                    name="last_name"
                                                    placeholder="Last Name" />
                                            </div>
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <input className={'form-control whiteBg '}
                                                    onChange={(e) => this.onFieldChange(e)}
                                                    value={form.address_line1}
                                                    name="address_line1"
                                                    placeholder="Address" />
                                            </div>
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <input className={'form-control whiteBg '}
                                                    onChange={(e) => this.onFieldChange(e)}
                                                    value={form.address_city}
                                                    name="address_city"
                                                    placeholder="City" />
                                            </div>
                                            <div className="form-field col-12 col-md-6 mb1 form-field form-country">
                                                {/* <label htmlFor="country">Country</label> */}
                                                <input
                                                    className="form-control whiteBg"
                                                    type="text"
                                                    id="location"
                                                    onFocus={() => this.setState({ openCountry: true })}
                                                    onBlur={() => { setTimeout(() => { this.setState({ openCountry: false }) }, 600) }}
                                                    autoComplete="false"
                                                    value={location}
                                                    autoComplete="new-password"
                                                    onChange={(e) => this.filterCountry(e)}
                                                    placeholder="Select Country" />
                                                {openCountry &&
                                                    <ul className="country-list">
                                                        {items}
                                                    </ul>
                                                }
                                            </div>
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <input className={'form-control whiteBg '}
                                                    onChange={(e) => this.onFieldChange(e)}
                                                    value={form.address_zip}
                                                    name="address_zip"
                                                    placeholder="Zipp Code" />
                                            </div>
                                        </div>
                                        <div>
                                            <button className="btn-blue" onClick={(e) => this.ConfirmOrder(e)}>Confirm changes</button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                }
            </div >


        );
    };
}

const mapStateToProps = (state) => {

    const twitterChannelsFilter = { selected: undefined, provider: "twitter" };
    const channels = channelSelector(state.channels.list, twitterChannelsFilter);
    const profile = state.profile
    return {
        channels,
        loading: state.channels.loading,
        profile
    };
};

const mapDispatchToProps = (dispatch) => ({
    startAddTwitterChannel: (accessToken, accessTokenSecret) => dispatch(startAddTwitterChannel(accessToken, accessTokenSecret)),
    startSetChannels: () => dispatch(startSetChannels()),
    startSetProfile: () => dispatch(startSetProfile()),
    logout: () => dispatch(logout())
});


export default connect(mapStateToProps, mapDispatchToProps)(CardEdit);