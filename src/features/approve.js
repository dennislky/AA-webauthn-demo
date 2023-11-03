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
import { ethers, BigNumber } from "ethers";

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
const ApprovalCard = () => {
  // mobx store
  const { appStore } = useStore();
  const accountAddress = appStore.accountAddress;

  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [value, setValue] = useState(0);

  // feature logic
  const approve = async ({ target, value }) => {
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

      const num = BigNumber.from(value.toString());
      const multiplier = BigNumber.from(10).pow(18);
      const valueBN = num.mul(multiplier);
      const approve = new ethers.utils.Interface([
        "function approve(address,uint256)",
      ]);
      const approveCallData = approve.encodeFunctionData("approve", [
        target,
        valueBN.toString(),
      ]);
      const execute = new ethers.utils.Interface([
        "function execute(address,uint256,bytes)",
      ]);
      const executeCallData = execute.encodeFunctionData("execute", [
        "0x22C1317FE43132b22860e8b465548613d6151a9F",
        0,
        approveCallData,
      ]);
      accountBuilder.setCallData(executeCallData);

      const response = await client.sendUserOperation(accountBuilder);
      appStore.approves.push({ txHash: response.userOpHash });

      // const userOperationEvent = await response.wait();
      // console.log("userOperationEvent", userOperationEvent);
      // if (userOperationEvent) {
      //   appStore.snackBarMessage = "Approval created successfully!";
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
            Approve
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            id="address"
            label="Address"
            variant="filled"
            onChange={(event) => {
              setAddress(event.target.value);
            }}
          />
          <TextField
            id="value"
            label="Value"
            variant="filled"
            onChange={(event) => {
              setValue(event.target.value);
            }}
          />
          <CardActionButton
            buttonText="Approve"
            sx={{ ml: 1 }}
            onClick={() =>
              approve({
                target: address,
                value: value * 1000,
              })
            }
            testId="approve"
            loading={isLoading}
          />
        </CardActions>
        {appStore.approves.map((approve, index) => {
          return (
            <CardContent sx={{ pb: 1 }} key={index}>
              {approve.txHash && (
                <Typography sx={{ fontSize: 16 }}>
                  {"Transaction Details: "}
                  <Link
                    underline="always"
                    target="_blank"
                    rel="noopener"
                    href={`https://dashboard.tenderly.co/tx/sepolia/${approve.txHash}?trace=0`}
                  >
                    {approve.txHash}
                  </Link>
                </Typography>
              )}
            </CardContent>
          );
        })}
      </Card>
    </>
  ) : null;
};

export default observer(ApprovalCard);
