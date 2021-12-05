import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";
import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";

const App = ({currentUser}) => {
  return (
    <Grid column="equal" className="app" style={{ backgroundColor: '#eee' }}>
      <ColorPanel />
      <SidePanel  currentUser = {currentUser}/>

      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages />
      </Grid.Column>

      <Grid.Column style={{ marginLeft: 320 }}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

const mapStateToProps = (state) => {
  return { currentUser: state.user.currentUser };
}

export default connect(mapStateToProps)(App);
