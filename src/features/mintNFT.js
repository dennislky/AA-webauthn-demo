import { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Link,
} from "@mui/material";
import { ethers } from "ethers";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { nftAddress } from "../constants";

// card per feature
const MintNFTCard = () => {
  // mobx store
  const { appStore } = useStore();
  const accountAddress = appStore.accountAddress;

  const [isLoading, setIsLoading] = useState(false);

  // feature logic
  const mintNFT = async () => {
    if (!appStore.accountAddress) {
      appStore.showSnackBar("Please create account first");
    }
    try {
      setIsLoading(true);
      const builder = await appStore.getNewAccountBuilder();

      const execute = new ethers.utils.Interface([
        "function execute(address,uint256,bytes)",
      ]);
      const executeCallData = execute.encodeFunctionData("execute", [
        nftAddress,
        0,
        "0x1249c58b",
      ]);
      builder.setCallData(executeCallData);

      const response = await appStore.client.sendUserOperation(builder);
      appStore.addNFTTransaction(response.userOpHash);

      const userOperationEvent = await response.wait();
      console.log("userOperationEvent", userOperationEvent);
      if (userOperationEvent) {
        appStore.showSnackBar("NFT minted successfully!");
      }

      const receipt = await appStore.provider.getTransactionReceipt(
        response.userOpHash
      );
      console.log("receipt", receipt);
      if (receipt) {
        appStore.nftTransactions = appStore.nftTransactions.map((tx) => {
          if (tx.txHash === response.userOpHash) {
            tx.txDoneHash = receipt.transactionHash;
          }
          return tx;
        });
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
            Mint NFT
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <CardActionButton
            buttonText="Mint NFT"
            sx={{ ml: 1 }}
            onClick={mintNFT}
            testId="mint-NFT"
            loading={isLoading}
          />
        </CardActions>
        {appStore.nftTransactions.map((transaction, index) => {
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
              {transaction.txDoneHash && (
                <Typography sx={{ fontSize: 16 }}>
                  {"Transaction Logs: "}
                  <Link
                    underline="always"
                    target="_blank"
                    rel="noopener"
                    href={`https://sepolia.etherscan.io/tx/${transaction.txDoneHash}#eventlog`}
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

export default observer(MintNFTCard);
