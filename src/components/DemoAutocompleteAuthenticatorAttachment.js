import { Autocomplete, TextField } from "@mui/material";

import { attachmentOptions } from "../constants";

const DemoAutocompleteAuthenticatorAttachment = ({ setAttachment }) => {
  return (
    <Autocomplete
      options={attachmentOptions}
      sx={{ width: 288, py: 1, pr: 1 }}
      renderInput={(params) => (
        <TextField {...params} label="Authenticator Attachment" />
      )}
      onChange={(_, value) => {
        setAttachment(value?.value);
      }}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      data-testid="autocomplete-authenticator-attachment"
    />
  );
};

export { DemoAutocompleteAuthenticatorAttachment };
