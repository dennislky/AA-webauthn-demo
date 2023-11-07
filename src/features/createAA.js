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
// import { ethers } from "ethers";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
// import { ERC20ABI, tokenApprovalAddress } from "../constants";

// card per feature
const CreateAACard = () => {
  // mobx store
  const { appStore } = useStore();
  const isInit = appStore.isInit;
  const accountAddress = appStore.accountAddress;
  const isAccountCreated =
    localStorage.getItem("account") && !sessionStorage.getItem("account");

  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState("");

  // feature logic
  const createAccount = async () => {
    if (!isInit) {
      appStore.showSnackBar("Please initialize credential first");
    }
    try {
      setIsLoading(true);
      const builder = await appStore.getInitAccountBuilder();
      const response = await appStore.client.sendUserOperation(builder);
      appStore.createAccount(response.userOpHash, builder.getSender());

      const userOperationEvent = await response.wait();
      console.log("userOperationEvent", userOperationEvent);
      if (userOperationEvent) {
        appStore.showSnackBar("Account created successfully!");
      }

      // const erc20 = new ethers.Contract(
      //   tokenApprovalAddress,
      //   ERC20ABI,
      //   appStore.provider
      // );
      // console.log("erc20 contract", erc20);
      // const balanceOf = await erc20.balanceOf(builder.getSender());
      // appStore.updateAccountBalance(
      //   await erc20.symbol(),
      //   ethers.utils.formatUnits(balanceOf, await erc20.decimals())
      // );
    } catch (err) {
      console.error(err);
      appStore.showSnackBar(`${err.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };
  const bindAccount = async () => {
    if (!isInit) {
      appStore.showSnackBar("Please initialize credential first");
    }
    try {
      setIsLoading(true);
      appStore.restoreLocalAccount(address);
      appStore.restoreLocalEmail();
    } catch (err) {
      console.error(err);
      appStore.showSnackBar(`${err.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };
  const resetAccount = async () => {
    appStore.resetAccount();
  };

  // render logic
  return isInit ? (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            AA Account
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          {isAccountCreated && (
            <TextField
              id="address"
              label="Address"
              variant="filled"
              onChange={(event) => {
                setAddress(event.target.value);
              }}
            />
          )}
          <CardActionButton
            buttonText={isAccountCreated ? "Bind Account" : "Create Account"}
            onClick={isAccountCreated ? bindAccount : createAccount}
            testId="create-account"
            loading={isLoading}
            disabled={!!accountAddress}
            sx={{ ml: isAccountCreated ? 1 : 0 }}
          />
          <CardActionButton
            buttonText="Reset Account"
            onClick={resetAccount}
            testId="reset-account"
          />
        </CardActions>
        {appStore.createAccountTxHash && (
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
            {/* {appStore.accountBalances.length ? (
              <Typography sx={{ fontSize: 16 }}>
                {`Account Balance: ${appStore.accountBalances
                  .map((balance) => {
                    return `${balance.amount} ${balance.token}`;
                  })
                  .join(", ")}`}
              </Typography>
            ) : null} */}
          </CardContent>
        )}
      </Card>
    </>
  ) : null;
};

export default observer(CreateAACard);
