import React from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channel from "./Channel";

class SidePanel extends React.Component {
  render() {
    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ backgroundColor: '#4c3c4c', fontSize: '1.2 rem' }}
      >

        <UserPanel currentUser= {this.props.currentUser}/>
        <Channel currentUser= {this.props.currentUser}/>

      </Menu>
    );
  }
}

export default SidePanel;
