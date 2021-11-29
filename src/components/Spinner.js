import React from "react";
import { Loader, Dimmer } from "semantic-ui-react";

const Spinner = ({ size, content }) => {
  return (
    <Dimmer>
      <Loader size={size} content={content} />
    </Dimmer>
  );
};

export default Spinner;
