import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reducer from "./components/reducers";
import { setUser, clearUser } from "./components/actions";
import Loader from "react-loader-spinner";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import firebase from "./firebase";
import "semantic-ui-css/semantic.min.css";

const store = createStore(reducer, composeWithDevTools());

class Root extends React.Component {
  componentDidMount() {
    const auth = firebase.auth();
    firebase.onAuthStateChanged(auth, (user) => {
      if (user) {
        this.props.setUser(user);
        this.props.history.push("/");
      }

      else {
        this.props.history.push("/register");
        this.props.clearUser();
      }
    });
  }
  render() {
    return this.props.isLoading ? (
      <Loader
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        type="Bars"
        color="#777"
        height={73}
        width={73}
      />
    ) : (
      <Switch>
        <Route exact path="/register" component={Register} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/" component={App} />
      </Switch>
    );
  }
}

const mapStateToProps = (state) => {
  return { isLoading: state.user.isLoading };
};

const AppWithAuth = withRouter(connect(mapStateToProps, { setUser, clearUser })(Root));

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <AppWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);
