import { Autocomplete, TextField } from "@mui/material";

import { transportOptions } from "../constants";

const DemoAutocompleteTransports = ({ setTransports }) => {
  return (
    <Autocomplete
      multiple
      options={transportOptions}
      sx={{ width: 288, py: 1, pr: 1 }}
      renderInput={(params) => <TextField {...params} label="Transports" />}
      onChange={(_, values) => {
        setTransports(values.map((value) => value.value));
      }}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      data-testid="autocomplete-transports"
    />
  );
};

export { DemoAutocompleteTransports };
