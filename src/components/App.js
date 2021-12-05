import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";

import ColorPanel from "./ColorPanel";
import SidePanel from "./SidePanel";
import Messages from "./Messages";
import MetaPanel from "./MetaPanel";

const App = () => {
  return (
    <Grid column="equal" className="app" style={{ backgroundColor: '#eee' }}>
      <ColorPanel />
      <SidePanel />

      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages />
      </Grid.Column>

      <Grid.Column style={{ marginLeft: 320 }}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

export default App;
