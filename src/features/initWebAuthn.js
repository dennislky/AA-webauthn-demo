import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";

import { Card, CardContent, CardActions, Typography } from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { DemoDialog } from "../components/DemoDialog";
import { useStore } from "../stores";

// card per feature
const InitWebAuthnCard = () => {
  // local UI state
  const [showDialog, setShowDialog] = useState(false);

  // mobx store
  const { appStore } = useStore();
  const isInit = appStore.isInit;

  // local UI state cleanup when WebAuthn re-initialized
  useEffect(() => {
    setShowDialog(false);
  }, [isInit]);

  // event handler
  const confirmDialog = () => {
    appStore.dispose();
    setShowDialog(false);
  };
  const closeDialog = () => {
    setShowDialog(false);
  };

  // feature logic
  const initWebAuthn = () => {
    appStore.initialize();
  };
  const dispose = () => {
    setShowDialog(true);
  };
  const linkToGithub = () => {
    window.open("https://github.com/dennislky/AA-webauthn-demo", "_blank");
  };

  // render logic
  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            WebAuthn
          </Typography>
          {isInit && (
            <Typography display="inline" sx={{ fontSize: 14, color: "blue" }}>
              {" (Initialized)"}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          {!isInit ? (
            <CardActionButton
              buttonText="Initialize"
              onClick={initWebAuthn}
              testId="initialize"
            />
          ) : (
            <CardActionButton
              buttonText="Dispose"
              onClick={dispose}
              testId="dispose"
            />
          )}
          <CardActionButton buttonText="Github" onClick={linkToGithub} />
        </CardActions>
      </Card>
      <DemoDialog
        title={"Are you sure?"}
        content={"The Passkeys generated will be lost!"}
        showDialog={showDialog}
        handleClose={closeDialog}
        handleConfirm={confirmDialog}
      />
    </>
  );
};

export default observer(InitWebAuthnCard);
