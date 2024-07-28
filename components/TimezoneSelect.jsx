import React from "react";
import { Select } from "@chakra-ui/react";
import moment from "moment";
import "moment-timezone";

const TimezoneSelect = ({ value, onChange }) => {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {moment.tz.names().map((timezone, index) => (
        <option key={index} value={timezone}>
          {timezone}
        </option>
      ))}
    </Select>
  );
};

export default TimezoneSelect;
