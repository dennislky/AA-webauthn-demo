import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardContent, CardActions, Typography } from "@mui/material";
import { ethers, BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { utils } from "@passwordless-id/webauthn";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import {
  chainId,
  recoveryEmailDestination,
  webAuthnABI,
  webAuthnValidatorAddress,
} from "../constants";

// card per feature
const SendRecoveryEmailCard = () => {
  // mobx store
  const { appStore } = useStore();
  const accountEmail = appStore.recoveryEmail;

  const [isLoading, setIsLoading] = useState(false);
  const [recoveredPublicKey, setRecoveredPublicKey] = useState("0x");

  const webAuthn = useMemo(() => {
    if (!appStore.provider) return;
    return new ethers.Contract(
      webAuthnValidatorAddress,
      webAuthnABI,
      appStore.provider
    );
  }, [appStore.provider]);

  useEffect(() => {
    const getPublicKey = async () => {
      const publicKey = accountEmail
        ? await webAuthn.publicKeys(
            appStore.accountAddress,
            appStore.createCredentialId
          )
        : "0x";
      return publicKey;
    };
    getPublicKey().then((publicKey) => {
      if (publicKey !== "0x") {
        setRecoveredPublicKey(publicKey);
      }
    });
  }, [
    accountEmail,
    appStore.accountAddress,
    appStore.createCredentialId,
    webAuthn,
  ]);

  // feature logic
  const sendRecoveryEmail = async () => {
    if (!accountEmail) {
      appStore.showSnackBar("Please add recovery email first");
    }
    try {
      setIsLoading(true);
      console.log("webAuthn contract", webAuthn);
      const email = await webAuthn.emails(appStore.accountAddress);
      console.log("email", email);
      const nonce = await webAuthn.recoveryNonce(appStore.accountAddress);
      console.log("nonce", BigNumber.from(nonce).toNumber());
      console.log("passkeyId", appStore.createCredentialId);
      const publicKey = await webAuthn.publicKeys(
        appStore.accountAddress,
        appStore.createCredentialId
      );
      console.log("publicKey", publicKey);
      const bufferX = Buffer.from(
        utils.parseBase64url(appStore.publicKey.x.toString())
      );
      const bufferY = Buffer.from(
        utils.parseBase64url(appStore.publicKey.y.toString())
      );
      const bytes = defaultAbiCoder.encode(
        ["uint256", "uint256"],
        [BigNumber.from(bufferX), BigNumber.from(bufferY)]
      );
      const encodeData = ethers.utils.defaultAbiCoder.encode(
        ["uint256", "address", "address", "uint256", "bytes", "string"],
        [
          chainId,
          webAuthnValidatorAddress,
          appStore.accountAddress,
          nonce,
          bytes,
          appStore.createCredentialId,
        ]
      );
      const sendTo = recoveryEmailDestination;
      window.open(
        `https://mail.google.com/mail/u/1/?view=cm&fs=1&tf=1&to=${sendTo}&su=${encodeData.slice(
          2
        )}`,
        "_blank"
      );
      // window.open(`mailto:${sendTo}?subject=${encodeData.slice(2)}`, "_blank");

      do {
        const publicKey = await webAuthn.publicKeys(
          appStore.accountAddress,
          appStore.createCredentialId
        );
        console.log("publicKey", publicKey);
        setRecoveredPublicKey(publicKey);
        await new Promise((r) => setTimeout(r, 2000));
      } while (recoveredPublicKey === "0x");
    } catch (err) {
      console.error(err);
      appStore.showSnackBar(`${err.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  // render logic
  return accountEmail ? (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            Send Recovery Email
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <CardActionButton
            buttonText="Send Recovery Email"
            sx={{ ml: 1 }}
            onClick={sendRecoveryEmail}
            testId="send-email"
            loading={isLoading}
          />
        </CardActions>
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 16 }}>
            {`Account Address: ${appStore.accountAddress}`}
            <br />
            {`Passkey ID: ${appStore.createCredentialId}`}
            <br />
            {`Public Key: ${recoveredPublicKey}`}
          </Typography>
        </CardContent>
      </Card>
    </>
  ) : null;
};

export default observer(SendRecoveryEmailCard);
