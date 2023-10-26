import { observer } from "mobx-react-lite";
import { Card, CardContent, CardActions, Typography } from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { DemoAutocompleteTransports } from "../components/DemoAutocompleteTransport";

// card per feature
const GetWebAuthnCard = () => {
  // mobx store
  const { appStore } = useStore();
  const isInit = appStore.isInit;

  // feature logic
  const getWebAuthn = async () => {
    const result = await appStore.getWebAuthn();
    if (result === true) {
      appStore.snackBarMessage = "Passkey signed successfully!";
    } else {
      appStore.snackBarMessage = `${result.toString()}`;
    }
    appStore.openSnackBar = true;
  };
  const setTransports = (transports) => {
    appStore.transports = transports;
  };

  // render logic
  return isInit ? (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            Get Passkey
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <DemoAutocompleteTransports setTransports={setTransports} />
          <CardActionButton
            buttonText="Get Passkey"
            onClick={getWebAuthn}
            testId="get-passkey"
          />
        </CardActions>
      </Card>
    </>
  ) : null;
};

export default observer(GetWebAuthnCard);
