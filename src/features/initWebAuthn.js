import { observer } from "mobx-react-lite";

import { Card, CardContent, CardActions, Typography } from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { DemoAutocompleteAuthenticatorAttachment } from "../components/DemoAutocompleteAuthenticatorAttachment";

// card per feature
const InitWebAuthnCard = () => {
  // mobx store
  const { appStore } = useStore();
  const isInit = appStore.isInit;

  // feature logic
  const initWebAuthn = async () => {
    const result = await appStore.initialize();
    if (result === true) {
      appStore.snackBarMessage = "Passkey created successfully!";
    } else {
      appStore.snackBarMessage = `${result.toString()}`;
    }
    appStore.openSnackBar = true;
  };
  const setAttachment = (attachment) => {
    appStore.attachment = attachment;
  };

  // render logic
  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            Create Passkey
          </Typography>
          {isInit && (
            <Typography display="inline" sx={{ fontSize: 14, color: "blue" }}>
              {" (Passkey Initialized)"}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <DemoAutocompleteAuthenticatorAttachment
            setAttachment={setAttachment}
          />
          <CardActionButton
            buttonText="Create Passkey"
            onClick={initWebAuthn}
            testId="create-passkey"
          />
        </CardActions>
      </Card>
    </>
  );
};

export default observer(InitWebAuthnCard);