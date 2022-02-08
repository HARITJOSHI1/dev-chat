import React, { useState, useEffect, useMemo } from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";
import MessageHeader from "./MessageHeader";
import MessageForm from "./MessageForm";
import firebase from "../../firebase";
import Message from "./Message";
import { setTopPosters } from "../actions";
import Typing from "./Typing";

const Messages = ({ currentChannel, currentUser, setTopPosters, isPrivate }) => {
  const [channel, setChannel] = useState(null);
  const [messagesArray, setMessage] = useState([]);
  const [progressBar, setpg] = useState(false);
  const [users, countUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearched] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [privateTypingUsers, setPrivateTypingUsers] = useState([]);
  const [isStarred, setStarred] = useState(false);

  const displayChannelName = channel => channel ? `#${channel.name}` : " ";

  const handleStarred = () => {
    setStarred((state) => {
      setStarred(!state);
      addStarred(!state);
    });
  }

  const addStarred = (isStarred) => {
    const { createdUser: cu } = currentUser;
    const { ref, set, getDatabase, remove } = firebase.database;
    const db = getDatabase();
    if (isStarred) {
      const info = {
        name: currentChannel.name,
        details: currentChannel.details,
        id: currentChannel.id,
        createdBy: {
          avatar: cu.photoURL,
          name: cu.displayName
        }
      }
      set(ref(db, `users/${cu.uid}/starred/${currentChannel.id}`), info);
    }

    else remove(ref(db, `users/${cu.uid}/starred/${currentChannel.id}`));
  }


  const setPrivateTypingListeners = (channel) => {
    const { ref, set, getDatabase, remove, onValue, onChildRemoved } = firebase.database;
    const db = getDatabase();
    onValue(ref(db, `privateTyping/`), snap => {
      const data = snap.val();
      let temp = [];
      const typingTo = channel.id.split('/')[0];
      if (data) {
        if (privateTypingUsers.length) temp = [];
        for (const key in data) {
          if (key === currentUser.createdUser.uid) {
            const d = data[key][typingTo];
            temp = temp.concat(d);
          }
        }
        setPrivateTypingUsers((state) => state = temp);
      }

      else {
        setPrivateTypingUsers([]);
      }
    });

    onChildRemoved((ref(db, `privateTyping/${channel.id}`)), snap => {
      setPrivateTypingUsers([]);
    });

  }

  const setTypingListeners = (channel) => {
    const { ref, set, getDatabase, remove, onValue, onChildRemoved } = firebase.database;
    const db = getDatabase();
    onValue(ref(db, `typing/${channel.id}`), snap => {
      const data = snap.val();
      let temp = [];
      if (data) {
        if (typingUsers.length) temp = [];
        for (const key in data) {
          if (key !== currentUser.createdUser.uid) {
            data[channel.id] = channel.id;
            
            temp = temp.concat(data);
          }
        }
        setTypingUsers((state) => state = temp);
      }

      else {
        setTypingUsers([]);
      }
    });

    onChildRemoved((ref(db, `typing/${channel.id}`)), snap => {
      const obj = {}
      let temp = [];
      obj[snap.key] = snap.val();
      const idx = typingUsers.findIndex((el) => el[snap.key] === obj[snap.key]);
      if (idx !== -1) temp = typingUsers.splice(idx, 1);
      setTypingUsers(temp);
    });

  }

  useEffect(() => {
    if (currentChannel && currentUser) {
      setChannel((state) => state = currentChannel);
      alreadyStarredInDB();
      getMessages();
      setTypingListeners(currentChannel);
      setPrivateTypingListeners(currentChannel);
    }
  }, [currentChannel]);

  const alreadyStarredInDB = () => {
    const { createdUser: cu } = currentUser;
    const { ref, onValue, getDatabase } = firebase.database;
    const db = getDatabase();
    onValue(ref(db, `users/${cu.uid}/starred/${currentChannel.id}`), (snap) => {
      if (snap.val()) setStarred(true);
    });

  }

  const getMessages = () => {
    let loadedMsg;
    const { ref, getDatabase, onValue } = firebase.database;
    const db = getDatabase();
    const channelRef = ref(db, `messages/${currentChannel.id}`);
    onValue(channelRef, (snap) => {
      const data = snap.val();
      if (data) {
        loadedMsg = Object.keys(data).map(key => (data[key]));
        countUniqueUser(loadedMsg);
        countTopPosters(loadedMsg);
        setMessage(loadedMsg);
      }

      else {
        countTopPosters([]);
        countUniqueUser([]);
        setMessage([]);
      }
    });
  }

  const countTopPosters = messages => {
    const HashMap = new Map();
    let c = 0;
    messages.forEach((msg, idx) => {
      const posts = HashMap.get(msg.user.name);
      if (posts) HashMap.set(msg.user.name, [posts[0] + 1, msg.user.avatar]);
      else HashMap.set(msg.user.name, [c + 1, msg.user.avatar]);
    });

    setTopPosters(HashMap);
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const searchMsg = () => {
    const channelMsgs = [...messagesArray];
    const regex = new RegExp(searchTerm, 'gi');
    const searchResults = channelMsgs.reduce((acc, msg) => {
      if ((msg.content && msg.content.match(regex)) ||
        (msg.user.name.match(regex))) {
        acc.push(msg);
      }
      return acc;
    }, []);

    setSearched(searchResults);
  }

  useMemo(() => {
    return searchMsg();
  }, [searchTerm]);

  const countUniqueUser = messages => {
    const uniqueUser = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) acc.push(message.user.name);
      return acc;
    }, []);

    const plural = (uniqueUser.length > 1) || false;
    const length = uniqueUser.length;
    const numUser = length && plural ? `${length} users` : `1 user`;
    countUser(numUser);
  }

  const displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={currentUser.createdUser}
      />
    ));

  const isProgressBar = percent => {
    if (percent > 0) setpg(true);
  }

  const checkToStarr = (channel) => {
    const { createdUser: cu } = currentUser;
    const { ref, onValue, getDatabase } = firebase.database;
    const db = getDatabase();
    let d;
    onValue(ref(db, `users/${cu.uid}/starred`), (snap) => {
      const data = snap.val();
      if (data && channel) {
        d = data[channel.id];
      }
    });

    return d ? true : false;
  }

  const displayTypingContent = (numAreTypingUsers) => {
    if (numAreTypingUsers > 1) {
      return `${numAreTypingUsers} others are typing`;
    }
    return `${numAreTypingUsers} user is typing`;
  }


  const displayPrivateTypingUsers = () => {
    if (privateTypingUsers.length == 1) {
      const user = privateTypingUsers[0];
      if (user) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: "1rem" }}>
            <span className="user__typing">{user.name} is typing</span>
            <Typing />
          </div>
        );
      }

      else return null;
    }
    else return null;
  }

  const displayTypingUsers = () => {
    if (isPrivate) {
      return displayPrivateTypingUsers();
    }

    if (typingUsers.length > 0) {
      for (let el of typingUsers) {
        if (el[channel.id] === channel.id) {
          const numAreTypingUsers = typingUsers.length;
          return (<div style={{ display: 'flex', alignItems: 'center', marginTop: "1rem" }}>
            <span className="user__typing">{displayTypingContent(numAreTypingUsers)}</span>
            <Typing />
          </div>);
        }
      }
    }
    else return null;
  }

  return (
    <React.Fragment>
      <MessageHeader
        handleSearchChange={handleSearchChange}
        channelName={displayChannelName(channel)}
        isStarred={checkToStarr(channel)}
        users={users}
        handleStarred={handleStarred}
      />

      <Segment>
        <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
          {searchTerm ? displayMessages(searchResults) : displayMessages(messagesArray)}
          {displayTypingUsers()}
        </Comment.Group>
      </Segment>

      <MessageForm isProgressBar={isProgressBar} currentUser={currentUser} />
    </React.Fragment>
  )

}

const mapStateToProps = state => {
  return {
    isPrivate: state.channel.isPrivate
  }
}

export default connect(mapStateToProps, { setTopPosters })(Messages);
