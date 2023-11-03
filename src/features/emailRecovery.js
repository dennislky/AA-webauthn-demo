import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Link,
  TextField,
} from "@mui/material";
import { Client, Presets } from "userop";
import { SmartAccount } from "smart-accounts";
import { ethers } from "ethers";

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
const EmailRecoveryCard = () => {
  // mobx store
  const { appStore } = useStore();
  const accountAddress = appStore.accountAddress;

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  // feature logic
  const addRecoveryEmail = async ({ email }) => {
    if (!appStore.accountAddress) {
      appStore.snackBarMessage = "Please create account first";
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

      // const withdrawTo = new ethers.utils.Interface([
      //   "function withdrawTo(address,uint256)",
      // ]);
      // const withdrawToCallData = withdrawTo.encodeFunctionData("withdrawTo", [
      //   valueBN.toString(),
      // ]);
      const execute = new ethers.utils.Interface([
        "function execute(address,uint256,bytes)",
      ]);
      const executeCallData = execute.encodeFunctionData("execute", [
        "0x22C1317FE43132b22860e8b465548613d6151a9F",
        0,
        "0x",
      ]);
      accountBuilder.setCallData(executeCallData);

      const response = await client.sendUserOperation(accountBuilder);
      appStore.addRecoveryEmailTxHash = response.userOpHash;

      // const userOperationEvent = await response.wait();
      // console.log("userOperationEvent", userOperationEvent);
      // if (userOperationEvent) {
      //   appStore.snackBarMessage = "Recovery email added successfully!";
      //   appStore.openSnackBar = true;
      // }
    } catch (err) {
      console.error(err);
      appStore.snackBarMessage = `${err.toString()}`;
      appStore.openSnackBar = true;
    } finally {
      setIsLoading(false);
    }
  };

  // render logic
  return accountAddress ? (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            Add Recovery Email
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            id="email"
            label="Email"
            variant="filled"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
          <CardActionButton
            buttonText="Add Recovery Email"
            sx={{ ml: 1 }}
            onClick={() =>
              addRecoveryEmail({
                email,
              })
            }
            testId="send-transaction"
            loading={isLoading}
          />
        </CardActions>
        {appStore.addRecoveryEmailTxHash && (
          <CardContent sx={{ pb: 1 }}>
            {appStore.addRecoveryEmailTxHash && (
              <Typography sx={{ fontSize: 16 }}>
                {"Transaction Details: "}
                <Link
                  underline="always"
                  target="_blank"
                  rel="noopener"
                  href={`https://dashboard.tenderly.co/tx/sepolia/${appStore.addRecoveryEmailTxHash}?trace=0`}
                >
                  {appStore.addRecoveryEmailTxHash}
                </Link>
              </Typography>
            )}
          </CardContent>
        )}
      </Card>
    </>
  ) : null;
};

export default observer(EmailRecoveryCard);
