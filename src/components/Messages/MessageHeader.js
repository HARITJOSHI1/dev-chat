import React from "react";
import { connect } from "react-redux";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

class MessagesHeader extends React.Component {

    render() {
        const {
            channelName,
            users,
            handleSearchChange,
            handleStarred,
            isStarred,
            isPrivate
        } = this.props;

        return (
            <Segment clearing>
                {/* Channel Title */}
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
                    <span>
                        {isPrivate ?  `@ ${channelName.slice(1)}` : channelName}
                        {!isPrivate && (<Icon
                            onClick={handleStarred}
                            name={isStarred ? "star" : "star outline"}
                            color={isStarred ? "yellow" : "black"}
                        />)}
                    </span>
                    <Header.Subheader>{users}</Header.Subheader>
                </Header>

                {/* Channel Search Input */}
                <Header floated="right">
                    <Input
                        onChange={handleSearchChange}
                        size="mini"
                        icon="search"
                        name="searchTerm"
                        placeholder="Search Messages"
                    />
                </Header>
            </Segment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isPrivate: state.channel.isPrivate
    }
}

export default connect(mapStateToProps)(MessagesHeader);