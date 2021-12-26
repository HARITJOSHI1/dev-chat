import * as actionTypes from "../actions/types";
import { combineReducers } from "redux";

const initialUser = {
  currentUser: null,
  isLoading: true,
};

const initialChannel = {
  currentChannel: null,
};

const user_reducer = (state = initialUser, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload,
        isLoading: false
      };

    case actionTypes.CLEAR_USER:
      return { ...state, isLoading: false };

    default:
      return state;
  }
};


const channel = (state = initialChannel, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        currentChannel: action.payload.currentChannel,
      };

    default:
      return state;
  }
};

export default combineReducers({
  user: user_reducer,
  channel
})
