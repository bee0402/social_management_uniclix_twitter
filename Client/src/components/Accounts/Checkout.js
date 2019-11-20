import React from 'react';
import { connect } from 'react-redux';
import { isValid } from 'cc-validate';
import Picker from 'react-month-picker'
import GeoSuggest from "react-geosuggest";
import SweetAlert from "sweetalert2-react";
import { startAddTwitterChannel, startSetChannels } from "../../actions/channels";
import channelSelector from "../../selectors/channels";
import { logout } from "../../actions/auth";
import { LoaderWithOverlay } from "../Loader";
import UpgradeAlert from "../UpgradeAlert";
import CongratsPayment from "./CongratsPayment";
import { createSubscription } from '../../requests/billing';
import { stripePublishableKey } from '../../config/api';

class Checkout extends React.Component {
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
        forbidden: false,
        validClaas: "",
        locations: [],
        years: [],
        loading: false,
        validClaasCvv: "",
        shouldBlockNavigation: true,
        newAccounts: 0,
        form: {
            cardnumber: '',
            cvc: '',
            exp_month: '',
            exp_year: '',
            exp_date: '',
            name: '',
            last_name: '',
            address_line1: '',
            address_city: '',
            location: '',
            postal: ''
        }
    }

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
        this.newAccountstoPay();
        this.activeYears();
        this.loadStripe();
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

    onDateChange = (e) => {

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

    onLocationsFieldChange = (location) => {
        this.setState(() => ({
            form: {
                ...this.state.form,
                location: location
            }
        }));
    };

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

    newAccountstoPay = () => {
        this.setState({
            newAccounts: (this.props.channels).filter(channel => channel.details.paid == 0).length
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
            address_zip: this.state.form.postal,
            address_line1: this.state.form.address_line1
        }, (status, response) => {

            if (status === 200) {
                this.onToken(response)
            } else {
                console.log(response)
                this.setState({
                    loading: true,
                    message: ""
                });
            }
        });
    }

    onToken = (token) => {
        token.plan = "twitter-booster"
        token.trialDays = 0
        token.created = new Date().getTime();
        token.subType = "main"
        createSubscription(token).then(response => {
            this.setState({
                loading: true,
                orderFinished: true
            });
            console.log(response)
        }).catch(e => {
            console.log(e)
            this.setState({
                loading: true,
                message: ""
            });
        })
    }

    render() {
        const { validClaas, form, locations, years, loading, orderFinished, newAccounts } = this.state
        const location = form.location;
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

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="section-header no-border">
                                            <div className="section-header__first-row">
                                                <h2>Checkout</h2>
                                            </div>
                                            <p>Review your order summary and enter your payment information to complete the purchase</p>
                                        </div>
                                    </div>
                                </div>


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
                                        <div>
                                            <p>Send receipt to my email
                                                <label className="switch round">
                                                    <input type="checkbox" defaultChecked='checked' onChange={(e) => this.activateDm(e)} />
                                                    <span className="slider round"></span>
                                                    <p className={"off"}>Off</p>
                                                    <p className={"on"}>On</p>
                                                </label>
                                            </p>
                                        </div>
                                        <div className="row">
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <input className={'form-control whiteBg '}
                                                    onChange={(e) => this.onFieldChange(e)}
                                                    value={form.name}
                                                    name="name"
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
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <GeoSuggest
                                                    className="col-12"
                                                    inputClassName="form-control whiteBg"
                                                    placeholder="Country"
                                                    onSuggestSelect={this.onLocationsFieldChange}
                                                    initialValue={location && location.label}
                                                    disabled={locations.length >= 5 ? true : false}
                                                />
                                                <input type="hidden" id="website" readOnly={true}
                                                    value={this.state.locations.map(location => ` ${location.label}`)}
                                                    onClick={this.toggleLocationsModal}
                                                    placeholder="New York City, Amsterdam, Venice..." />

                                            </div>
                                            <div className="form-field col-12 col-md-6 mb1">
                                                <input className={'form-control whiteBg '}
                                                    onChange={(e) => this.onFieldChange(e)}
                                                    value={form.postal}
                                                    name="postal"
                                                    placeholder="Zipp Code" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-5">
                                        <div className=" plan-info-container">
                                            <h3>Order summary</h3>

                                            <div className="plan-content table">
                                                <div className="row-price">
                                                    <div className="col-price">
                                                        <p className="plan-content-description">Current price</p>
                                                        <p className="plan-content-accounts">x{this.props.channels.length} accounts</p>
                                                    </div>
                                                    <div className="col-price">
                                                        <p className="price">$10</p>
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="row-price new-accounts">
                                                    <div className="col-price">
                                                        <p className="plan-content-accounts">x{newAccounts} accounts</p>
                                                    </div>
                                                    <div className="col-price">
                                                        <p className="price">${newAccounts * 20}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="order-total table">
                                                <div className="row-price">
                                                    <div className="col-price">
                                                        <p className="plan-content-description">TOTAL</p>
                                                        <p className="plan-content-accounts">Monthly</p>
                                                    </div>
                                                    <div className="col-price">
                                                        <p className="price">$30</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="discount-cnt">
                                                <input className="discount" placeholder="Add discount code" />
                                            </div>

                                            <button className="btn-blue" onClick={(e) => this.ConfirmOrder(e)}>Confirm order</button>
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
    logout: () => dispatch(logout())
});


export default connect(mapStateToProps, mapDispatchToProps)(Checkout);