import * as actionTypes from "./types";

export const setUser = user => {
    return {
        type: actionTypes.SET_USER,
        payload: {
            createdUser: user
        }
    }
}

export const clearUser = () => {
    return {
        type: actionTypes.CLEAR_USER
    }
}

export const setCurrentChannel = channel => {
    return {
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
            currentChannel: channel
        }
    }
}

export const setPrivateChannel = isPrivate => {
    return {
        type: actionTypes.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivate
        }
    }
}

export const setNotifications = notifications => {
    return {
        type: actionTypes.SET_NOTIFY_CHANNEL,
        payload: {
            notifications
        }
    }
}

export const setTopPosters = posters => {
    return {
        type: actionTypes.SET_TOP_POSTERS,
        payload: {
            posters
        }
    }
}

export const setColors = (primary, secondary) => {
    return {
        type: actionTypes.SET_COLORS,
        payload: {
            primary, secondary
        }
    }
}