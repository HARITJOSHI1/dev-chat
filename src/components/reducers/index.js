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

const notifications = (state = [], action) =>{
  switch(action.type){
    case actionTypes.SET_NOTIFY_CHANNEL:
      return [ ...action.payload.notifications];

    default:
      return state;  
  }
}

export default combineReducers({
  user: user_reducer,
  channel,
  notifications
})
