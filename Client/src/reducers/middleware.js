export default (state = {}, action) => {
    switch (action.type) {
        case "SET_MIDDLEWARE":
            return {
                step: action.middleware
            };
        case "SET_HASHTAGS":
            return {
                stepHashtags: action.middleware
            };
        case "SET_CONNECTS":
            return {
                stepSuggested: action.middleware
            };
        default:
            return state;
    }
};