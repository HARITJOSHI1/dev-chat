import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";
import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";

const App = ({ currentUser, currentChannel, channel, primaryColor, secondaryColor }) => {
  return (
    <Grid column="equal" className="app" style={{ backgroundColor: secondaryColor }}>
      <ColorPanel currentUser={currentUser.createdUser}/>
      <SidePanel primaryColor = {primaryColor} currentUser={currentUser} />

      <Grid.Column style={{ marginLeft: 320, width: '48%' }}>
        <Messages
          currentUser={currentUser}
          currentChannel={currentChannel}
        />
      </Grid.Column>

      <Grid.Column style={{marginLeft: 10, width: '30%' }}>
        <MetaPanel channel={channel}/>
      </Grid.Column>
    </Grid>
  );
};

const mapStateToProps = (state) => {
  return {
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    channel: state.channel,
    primaryColor: state.colors.primary,
    secondaryColor: state.colors.secondary,
  };
}

export default connect(mapStateToProps)(App);
