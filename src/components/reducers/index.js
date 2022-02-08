import * as actionTypes from "../actions/types";
import { combineReducers } from "redux";

const initialUser = {
  currentUser: null,
  isLoading: true,
};

const initialChannel = {
  currentChannel: null,
  isPrivate: false
};

const initialColors = {
  primary: "#4c3c4c",
  secondary: "#eee"
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
        ...state,
        currentChannel: action.payload.currentChannel,
        isPrivate: false
      };

    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivate: action.payload.isPrivate,
      };

    default:
      return state;
  }
};

const notifications = (state = [], action) => {
  switch (action.type) {
    case actionTypes.SET_NOTIFY_CHANNEL:
      return [...action.payload.notifications];

    default:
      return state;
  }
}

const topPosters = (state = {}, action) => {
  switch (action.type) {
    case actionTypes.SET_TOP_POSTERS:
      let temp = [];
      let obj = {};
      if (action.payload.posters.size === 0) return obj;

      action.payload.posters.forEach((value, key) => {
        temp.push([key, value]);
      });

      temp.sort((a, b) => {
        if (a[1][0] < b[1][0]) return 1;
        else if (a[1][0] > b[1][0]) return -1;
        else return 0;
      });

      temp.forEach(ele => obj[ele[0]] = ele[1]);

      return obj;

    default:
      return state;
  }
}

const colors = (state = initialColors, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {...action.payload};

    default:
      return state;
  }
}

export default combineReducers({
  user: user_reducer,
  channel,
  notifications,
  topPosters,
  colors
})
