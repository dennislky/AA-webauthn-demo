import { useState } from "react";
import { observer } from "mobx-react-lite";
import { Card, CardContent, CardActions, Typography } from "@mui/material";
import { ethers, BigNumber } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { utils } from "@passwordless-id/webauthn";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { chainId, webAuthnValidatorAddress } from "../constants";

// card per feature
const SendRecoveryEmailCard = () => {
  // mobx store
  const { appStore } = useStore();
  const accountEmail = appStore.recoveryEmail;

  const [isLoading, setIsLoading] = useState(false);

  // feature logic
  const sendRecoveryEmail = async () => {
    if (!accountEmail) {
      appStore.showSnackBar("Please add recovery email first");
    }
    try {
      setIsLoading(true);

      const abi = [
        "function emails(address) view returns (string)",
        "function recoveryNonce(address) view returns (uint256)",
        "function publicKeys(address, string) view returns (bytes)",
      ];
      const webAuthn = new ethers.Contract(
        webAuthnValidatorAddress,
        abi,
        appStore.provider
      );
      console.log("webAuthn contract", webAuthn);
      const email = await webAuthn.emails(appStore.accountAddress);
      console.log(email);
      const nonce = await webAuthn.recoveryNonce(appStore.accountAddress);
      console.log(BigNumber.from(nonce).toNumber());
      console.log(appStore.createCredentialId);
      const publicKey = await webAuthn.publicKeys(
        appStore.accountAddress,
        appStore.createCredentialId
      );
      console.log(publicKey);
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
      const sendTo = "wujinzhou@live.com";
      window.open(`mailto:${sendTo}?subject=${encodeData.slice(2)}`, "_blank");
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
      </Card>
    </>
  ) : null;
};

export default observer(SendRecoveryEmailCard);
