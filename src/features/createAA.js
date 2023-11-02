import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Link,
} from "@mui/material";
import { Client, Presets } from "userop";
import { SmartAccount } from "smart-accounts";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { WebAuthnSigner } from "./signers/webAuthnSigner";
import {
  bundlerUrl,
  webAuthnValidatorAddress,
  accountFactoryAddress,
  paymasterUrl,
  sepoliaRpcUrl,
  entryPointAddress,
} from "../constants";

// card per feature
const CreateAACard = () => {
  // mobx store
  const { appStore } = useStore();
  const isInit = appStore.isInit;

  const [isLoading, setIsLoading] = useState(false);

  // feature logic
  const createAccount = async () => {
    if (!appStore.isInit) {
      appStore.snackBarMessage = "Please create passkey first";
      appStore.openSnackBar = true;
    }
    try {
      setIsLoading(true);
      const signer = new WebAuthnSigner(
        appStore.transports,
        webAuthnValidatorAddress,
        appStore.createCredential,
        appStore.publicKey
      );

      const client = await Client.init(sepoliaRpcUrl, {
        entryPoint: entryPointAddress,
        overrideBundlerRpc: bundlerUrl,
      });
      const accountBuilder = await SmartAccount.init(signer, sepoliaRpcUrl, {
        overrideBundlerRpc: bundlerUrl,
        entryPoint: entryPointAddress,
        factory: accountFactoryAddress,
        paymasterMiddleware: Presets.Middleware.verifyingPaymaster(
          paymasterUrl,
          {
            type: "payg",
          }
        ),
      });
      console.log("accountBuilder", accountBuilder);

      // cannot use bundler, need send data to entrypoint yourself
      const response = await client.sendUserOperation(accountBuilder);
      appStore.accountAddress = accountBuilder.getSender();
      appStore.createAccountTxHash = response.userOpHash;

      const userOperationEvent = await response.wait();
      console.log("userOperationEvent", userOperationEvent);
      // base.messages.push({
      //   text: "create account txHash: ",
      //   link: {
      //     text: userOperationEvent.transactionHash,
      //     href: `https://sepolia.etherscan.io/tx/${userOperationEvent?.transactionHash}`,
      //   },
      // });
      if (userOperationEvent) {
        appStore.snackBarMessage = "Account created successfully!";
        appStore.openSnackBar = true;
      }
    } catch (err) {
      console.error(err);
      appStore.snackBarMessage = `${err.toString()}`;
      appStore.openSnackBar = true;
    } finally {
      setIsLoading(false);
    }
  };

  // render logic
  return isInit ? (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            Create Account
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <CardActionButton
            buttonText="Create Account"
            onClick={createAccount}
            testId="create-account"
            loading={isLoading}
          />
        </CardActions>
        <CardContent sx={{ pb: 1 }}>
          {appStore.createAccountTxHash && (
            <Typography sx={{ fontSize: 16 }}>
              {"Transaction Details: "}
              <Link
                underline="always"
                target="_blank"
                rel="noopener"
                href={`https://dashboard.tenderly.co/tx/sepolia/${appStore.createAccountTxHash}?trace=0`}
              >
                {appStore.createAccountTxHash}
              </Link>
            </Typography>
          )}
          {appStore.accountAddress && (
            <Typography sx={{ fontSize: 16 }}>
              {"Account Address: "}
              <Link
                underline="always"
                target="_blank"
                rel="noopener"
                href={`https://sepolia.etherscan.io/address/${appStore.accountAddress}`}
              >
                {appStore.accountAddress}
              </Link>
            </Typography>
          )}
        </CardContent>
      </Card>
    </>
  ) : null;
};

export default observer(CreateAACard);
