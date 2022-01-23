import React from "react";
import { connect } from "react-redux";
import { Segment, Accordion, Header, Icon, Image, List } from "semantic-ui-react";

class MetaPanel extends React.Component {
  state = {
    channel: null,
    privateChannel: null,
    activeIndex: 0
  };

  componentDidUpdate(prevProps) {
    const { currentChannel: pc } = prevProps.channel;
    const { currentChannel: c } = this.props.channel;
    if ((c || pc)) {

      if (pc && (c.id !== pc.id)) {
        if (this.props.channel.isPrivate) {
          this.setState({ privateChannel: this.props.channel.currentChannel });
          return;
        }
        else if (!this.props.channel.isPrivate) {
          this.setState({ channel: this.props.channel.currentChannel, privateChannel: null });
          return;
        }
      }

      else if (c && !pc) {
        this.setState({ channel: this.props.channel.currentChannel });
      }
    }
  }


  setActiveIndex = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  };

  format(count){
    return count > 1 ? `${count} posts` : `${count} post`;
  }

  displayTopPosters = (posters) => {
    if (Object.keys(posters).length) {
      return Object.entries(posters).map(([key, val], idx) => {
        return(
        <List.Item key = { idx }>
          <Image avatar src = {val[1]}/>
          <List.Content>
            <List.Header as = "a">{key}</List.Header>
            <List.Description >{this.format(val[0])}</List.Description>
          </List.Content>
        </List.Item>
        );
      })
    }

    return null;
  }

  render() {
    const { activeIndex, privateChannel, channel } = this.state;

    if (privateChannel) return null;

    return (
      <Segment loading={!channel}>
        <Header as="h3" attached="top">
          #{channel && channel.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {channel && channel.details}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            <List>
              {this.displayTopPosters(this.props.topPosters)}
            </List>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.setActiveIndex}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Header>
              <Image circular src={channel && channel.createdBy.avatar} />
              {channel && channel.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    topPosters: state.topPosters
  }
}

export default connect(mapStateToProps)(MetaPanel);
