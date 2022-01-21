import React from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel";
import Channel from "./Channel";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";

class SidePanel extends React.Component {
  render() {
    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ backgroundColor: this.props.primaryColor, fontSize: '1.2 rem' }}
      >

        <UserPanel primaryColor = {this.props.primaryColor} currentUser= {this.props.currentUser}/>
        <Starred />
        <Channel currentUser= {this.props.currentUser}/>
        <DirectMessages currentUser= {this.props.currentUser}/>

      </Menu>
    );
  }
}

export default SidePanel;
