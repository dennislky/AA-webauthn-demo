import { observer } from "mobx-react-lite";
import { Card, CardContent, CardActions, Typography } from "@mui/material";
import { BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { utils } from "@passwordless-id/webauthn";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { DemoAutocompleteAuthenticatorAttachment } from "../components/DemoAutocompleteAuthenticatorAttachment";

// card per feature
const InitWebAuthnCard = () => {
  // mobx store
  const { appStore } = useStore();
  const isInit = appStore.isInit;

  let bytes = "0x";
  if (appStore.publicKey) {
    const bufferX = Buffer.from(
      utils.parseBase64url(appStore.publicKey.x.toString())
    );
    const bufferY = Buffer.from(
      utils.parseBase64url(appStore.publicKey.y.toString())
    );
    bytes = defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [BigNumber.from(bufferX), BigNumber.from(bufferY)]
    );
  }

  // feature logic
  const setAttachment = (attachment) => {
    appStore.attachment = attachment;
  };
  const initWebAuthn = async () => {
    const result = await appStore.initialize();
    appStore.showSnackBar(
      result === true
        ? "Passkey initialized successfully!"
        : `${result.toString()}`
    );
  };
  const resetAppStore = () => {
    appStore.reset();
  };

  // render logic
  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            Initialize Passkey
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
            buttonText="Initialize Passkey"
            onClick={initWebAuthn}
            testId="initialize-passkey"
            disabled={!!appStore.createCredentialId}
          />
          <CardActionButton
            buttonText="Reset Passkey"
            onClick={resetAppStore}
            testId="reset-passkey"
          />
        </CardActions>
        {appStore.createCredentialId && (
          <CardContent sx={{ pb: 1 }}>
            {appStore.createCredentialId && (
              <Typography sx={{ fontSize: 14 }}>
                {`Passkey ID: ${appStore.createCredentialId}`}
              </Typography>
            )}
            {appStore.publicKey && (
              <Typography sx={{ fontSize: 14 }}>
                {`Passkey Public Key: ${bytes}`}
              </Typography>
            )}
          </CardContent>
        )}
      </Card>
    </>
  );
};

export default observer(InitWebAuthnCard);
