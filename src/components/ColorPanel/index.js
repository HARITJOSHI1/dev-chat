import React from "react";
import firebase from "../../firebase";
import {connect} from "react-redux";
import { setColors } from "../actions";
// prettier-ignore
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from "semantic-ui-react";
import { SliderPicker } from "react-color";

class ColorPanel extends React.Component {
  state = {
    modal: false,
    primary: "",
    secondary: "",
    user: this.props.currentUser,
    userColor: []
  };

  componentDidMount() {
    const { ref, getDatabase, onValue } = firebase.database;
    const db = getDatabase();
    const colorRef = ref(db, `users/${this.state.user.uid}/colors`);
    onValue(colorRef, (snap) => {
      const data = snap.val();
      if (data) {
        const colors = Object.keys(data).map(key => (data[key]));
        this.setState({ userColor: colors });
      }
    })
  }

  handleChangePrimary = color => this.setState({ primary: color.hex });

  handleChangeSecondary = color => this.setState({ secondary: color.hex });

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors(this.state.primary, this.state.secondary);
    }
  };

  saveColors = (primary, secondary) => {
    const { set, ref, push, getDatabase} = firebase.database;
    const db = getDatabase();
    const key = push(ref(db, `users/${this.state.user.uid}/colors`)).key;
    set(ref(db, `users/${this.state.user.uid}/colors/${key}`), { primary, secondary }).then(() => {
      console.log("colors added");
      this.closeModal();
    });
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  displayUserColor(colors) {
    return colors.length > 0 &&
      colors.map((color, i) => (
        <React.Fragment key={i}>
          <Divider />
          <div
            className="color__container"
            onClick={() => this.props.setColors(color.primary, color.secondary)}
          >
            <div className="color__square" style={{ background: color.primary }}>
              <div
                className="color__overlay"
                style={{ background: color.secondary }}
              />
            </div>
          </div>
        </React.Fragment>
      ));

  }

  render() {
    const { modal, primary, secondary, userColor } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColor(userColor)}

        {/* Color Picker Modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary Color" />
              <SliderPicker
                color={primary}
                onChange={this.handleChangePrimary}
              />
            </Segment>

            <Segment inverted>
              <Label content="Secondary Color" />
              <SliderPicker
                color={secondary}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(null, {setColors})(ColorPanel);
