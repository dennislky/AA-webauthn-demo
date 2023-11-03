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
import { ethers, BigNumber } from "ethers";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { entryPointAddress } from "../constants";

// card per feature
const SendTransactionCard = () => {
  // mobx store
  const { appStore } = useStore();
  const accountAddress = appStore.accountAddress;

  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [value, setValue] = useState(0);

  // feature logic
  const sendTransaction = async ({ target, value }) => {
    if (!appStore.accountAddress) {
      appStore.showSnackBar("Please create account first");
    }
    try {
      setIsLoading(true);
      const builder = await appStore.getNewAccountBuilder();

      const num = BigNumber.from(value.toString());
      const multiplier = BigNumber.from(10).pow(18);
      const valueBN = num.mul(multiplier);
      const withdrawTo = new ethers.utils.Interface([
        "function withdrawTo(address,uint256)",
      ]);
      const withdrawToCallData = withdrawTo.encodeFunctionData("withdrawTo", [
        target,
        valueBN.toString(),
      ]);
      const execute = new ethers.utils.Interface([
        "function execute(address,uint256,bytes)",
      ]);
      const executeCallData = execute.encodeFunctionData("execute", [
        entryPointAddress,
        0,
        withdrawToCallData,
      ]);
      builder.setCallData(executeCallData);

      const response = await appStore.client.sendUserOperation(builder);
      appStore.addTransaction(response.userOpHash);

      // const userOperationEvent = await response.wait();
      // console.log("userOperationEvent", userOperationEvent);
      // if (userOperationEvent) {
      //   appStore.showSnackBar("Transaction created successfully!");
      // }
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
            Send Transaction
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
            buttonText="Send Transaction"
            sx={{ ml: 1 }}
            onClick={() =>
              sendTransaction({
                target: address,
                value: value * 1000,
              })
            }
            testId="send-transaction"
            loading={isLoading}
          />
        </CardActions>
        {appStore.transactions.map((transaction, index) => {
          return (
            <CardContent sx={{ pb: 1 }} key={index}>
              {transaction.txHash && (
                <Typography sx={{ fontSize: 16 }}>
                  {"Transaction Details: "}
                  <Link
                    underline="always"
                    target="_blank"
                    rel="noopener"
                    href={`https://dashboard.tenderly.co/tx/sepolia/${transaction.txHash}?trace=0`}
                  >
                    {transaction.txHash}
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

export default observer(SendTransactionCard);
