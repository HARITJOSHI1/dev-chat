import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown } from "semantic-ui-react";
import firebase from '../../firebase';

class UserPanel extends Component {

    handleSignOut = () => {
        const auth = firebase.auth();
        firebase.signOut(auth).then(() => console.log("Signed Out")).catch(e => console.error(e));
    }

    dropdownOptions = () => [
        {
            key: "user",
            text: <span>Signed in as <strong>User</strong></span>,
            disabled: true
        },

        {
            key: "avatar",
            text: <span>Change avatar</span>,
        },

        {
            key: "signOut",
            text: <span onClick={this.handleSignOut}>Sign Out</span>,
        }

    ]

    render() {
        return (
            <Grid style={{ backgroundColor: "#4c3c4c" }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: "2rem", margin: 0 }}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                    </Grid.Row>

                    <Header>
                        <Dropdown trigger={<span>User</span>} options={this.dropdownOptions()} />
                    </Header>
                </Grid.Column>
            </Grid>
        );
    }
}

export default UserPanel;