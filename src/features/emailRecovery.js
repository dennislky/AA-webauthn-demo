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
import { ethers } from "ethers";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { webAuthnValidatorAddress } from "../constants";
import { keccak256 } from "ethers/lib/utils";

// card per feature
const EmailRecoveryCard = () => {
  // mobx store
  const { appStore } = useStore();
  const accountAddress = appStore.accountAddress;

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  // feature logic
  const addRecoveryEmail = async ({ email }) => {
    if (!accountAddress) {
      appStore.showSnackBar("Please create account first");
    }
    try {
      setIsLoading(true);
      const builder = await appStore.getNewAccountBuilder();

      const opHash = keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "string"],
          [appStore.accountAddress, email]
        )
      );
      console.log("opHash", opHash);
      const signData = await appStore.signer.sign(opHash);
      const callData = ethers.utils.defaultAbiCoder.encode(
        ["address", "string", "bytes"],
        [appStore.accountAddress, email, signData]
      );

      const addRecoveryEmail = new ethers.utils.Interface([
        "function bindEmail(bytes)",
      ]);
      const bindEmailCallData = addRecoveryEmail.encodeFunctionData(
        "bindEmail",
        [callData]
      );
      console.log("bindEmailCallData", bindEmailCallData);
      const execute = new ethers.utils.Interface([
        "function execute(address,uint256,bytes)",
      ]);
      const executeCallData = execute.encodeFunctionData("execute", [
        webAuthnValidatorAddress,
        0,
        bindEmailCallData,
      ]);
      builder.setCallData(executeCallData);

      const response = await appStore.client.sendUserOperation(builder);
      appStore.addRecoveryEmail(response.userOpHash, email);

      const userOperationEvent = await response.wait();
      console.log("userOperationEvent", userOperationEvent);
      if (userOperationEvent) {
        appStore.showSnackBar("Recovery email added successfully!");
      }
    } catch (err) {
      console.error(err);
      appStore.showSnackBar(`${err.toString()}`);
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
            testId="add-recovery-email"
            loading={isLoading}
            disabled={!!appStore.recoveryEmail}
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
            {appStore.recoveryEmail && (
              <Typography sx={{ fontSize: 16 }}>
                {`Recovery Email: ${appStore.recoveryEmail}`}
              </Typography>
            )}
          </CardContent>
        )}
      </Card>
    </>
  ) : null;
};

export default observer(EmailRecoveryCard);
