import { makeAutoObservable } from "mobx";
import { Client, Presets } from "userop";
import { SmartAccount } from "smart-accounts";
import { ethers } from "ethers";

import {
  authenticate,
  createPasskey,
  verifySignature,
} from "../utils/webAuthn";
import { WebAuthnSigner } from "../signers/webAuthnSigner";
import {
  challenge,
  bundlerUrl,
  webAuthnValidatorAddress,
  accountFactoryAddress,
  paymasterUrl,
  sepoliaRpcUrl,
  entryPointAddress,
  chainId,
} from "../constants";
import {
  arrayBufferToHex,
  castPublicKeyToJWKObject,
  hexToArrayBuffer,
} from "../utils";
export default class AppStore {
  rootStore;

  openSnackBar = false;
  snackBarMessage = "";
  isInit = false;

  attachment = "auto";
  transports = ["hybrid", "internal"];
  createCredential;
  createCredentialId = "";
  publicKey;

  provider;
  signer;
  client;
  initAccountBuilder;
  newAccountBuilder;
  createAccountTxHash = "";
  accountAddress = "";
  accountBalances = [];

  approvals = [];
  transactions = [];
  nftTransactions = [];
  addRecoveryEmailTxHash = "";
  recoveryEmail = "";

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  async initialize() {
    try {
      const alchemyAPIKey = process.env.REACT_APP_ALCHEMY_API_KEY;
      const etherscanAPIKey = process.env.REACT_APP_ETHERSCAN_API_KEY;
      console.log(
        "alchemyAPIKey",
        !!alchemyAPIKey,
        "etherscanAPIKey",
        !!etherscanAPIKey
      );
      this.provider =
        alchemyAPIKey || etherscanAPIKey
          ? ethers.getDefaultProvider(chainId, {
              etherscan: etherscanAPIKey,
              alchemy: alchemyAPIKey,
            })
          : ethers.getDefaultProvider(chainId);
      console.log("provider", this.provider);

      const passkey = sessionStorage.getItem("passkey");
      if (!passkey) {
        const { credential, publicKey } = await createPasskey(this.attachment);
        this.createCredential = credential;
        this.createCredentialId = arrayBufferToHex(credential.rawId);

        const newPublicKey = castPublicKeyToJWKObject(publicKey);
        this.publicKey = newPublicKey;

        const newCredential = {
          id: credential.id,
          type: credential.type,
          rawId: this.createCredentialId,
          response: {
            attestationObject: arrayBufferToHex(
              credential.response.attestationObject
            ),
            clientDataJSON: arrayBufferToHex(
              credential.response.clientDataJSON
            ),
          },
        };
        sessionStorage.setItem(
          `passkey:${this.createCredentialId}`,
          JSON.stringify({
            credential: newCredential,
            publicKey: newPublicKey,
          })
        );
        sessionStorage.setItem(
          "passkey",
          JSON.stringify([`passkey:${this.createCredentialId}`])
        );
      } else {
        const passkeyArray = JSON.parse(passkey);
        const passkeyObj = JSON.parse(sessionStorage.getItem(passkeyArray[0]));
        this.createCredential = {
          ...passkeyObj.credential,
          rawId: hexToArrayBuffer(passkeyObj.credential.rawId),
          response: {
            attestationObject: hexToArrayBuffer(
              passkeyObj.credential.response.attestationObject
            ),
            clientDataJSON: hexToArrayBuffer(
              passkeyObj.credential.response.clientDataJSON
            ),
          },
        };
        this.createCredentialId = passkeyObj.credential.rawId;
        this.publicKey = passkeyObj.publicKey;
      }
      const accountItem = localStorage.getItem("account");
      if (accountItem) {
        const account = JSON.parse(accountItem);
        console.log("account", account);
        this.accountAddress = account.address;
        this.createAccountTxHash = account.txHash;
      }

      const accountEmail = localStorage.getItem("account:email");
      if (accountEmail) {
        const email = JSON.parse(accountEmail);
        console.log("accountEmail", email);
        this.recoveryEmail = email.email;
        this.addRecoveryEmailTxHash = email.txHash;
      }
      this.isInit = true;
      return this.isInit;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  async getWebAuthn() {
    try {
      const { credential } = await authenticate(
        challenge,
        this.createCredential.rawId,
        this.transports
      );
      const result = await verifySignature(credential, this.publicKey);
      return result;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  async createInitAccountBuilder() {
    const signer = new WebAuthnSigner(
      this.transports,
      webAuthnValidatorAddress,
      this.createCredential,
      this.createCredentialId,
      this.publicKey
    );
    this.signer = signer;

    const client = await Client.init(sepoliaRpcUrl, {
      entryPoint: entryPointAddress,
      overrideBundlerRpc: bundlerUrl,
    });
    this.client = client;

    const accountBuilder = await SmartAccount.init(signer, sepoliaRpcUrl, {
      overrideBundlerRpc: bundlerUrl,
      entryPoint: entryPointAddress,
      factory: accountFactoryAddress,
      paymasterMiddleware: Presets.Middleware.verifyingPaymaster(paymasterUrl, {
        type: "payg",
      }),
    });
    this.initAccountBuilder = accountBuilder;
    return this.initAccountBuilder;
  }

  async getInitAccountBuilder() {
    if (!this.initAccountBuilder) {
      return this.createInitAccountBuilder();
    }
    return this.initAccountBuilder;
  }

  async createNewAccountBuilder() {
    if (!this.signer) {
      const signer = new WebAuthnSigner(
        this.transports,
        webAuthnValidatorAddress,
        this.createCredential,
        this.createCredentialId,
        this.publicKey
      );
      this.signer = signer;
    }
    if (!this.client) {
      const client = await Client.init(sepoliaRpcUrl, {
        entryPoint: entryPointAddress,
        overrideBundlerRpc: bundlerUrl,
      });
      this.client = client;
    }
    const accountBuilder = await SmartAccount.new(
      this.accountAddress,
      this.signer,
      sepoliaRpcUrl,
      {
        overrideBundlerRpc: bundlerUrl,
        entryPoint: entryPointAddress,
        factory: accountFactoryAddress,
        paymasterMiddleware: Presets.Middleware.verifyingPaymaster(
          paymasterUrl,
          {
            type: "payg",
          }
        ),
      }
    );
    this.newAccountBuilder = accountBuilder;
    return this.newAccountBuilder;
  }

  async getNewAccountBuilder() {
    const passkey = sessionStorage.getItem("passkey");
    console.log("passkey", passkey);
    const passkeyArray = JSON.parse(passkey);
    const passkeyObj = JSON.parse(sessionStorage.getItem(passkeyArray[0]));
    console.log("passkeyObj", passkeyObj);
    if (!this.newAccountBuilder) {
      return this.createNewAccountBuilder();
    }
    return this.newAccountBuilder;
  }

  createAccount(txHash, address) {
    this.accountAddress = address;
    this.createAccountTxHash = txHash;
    localStorage.setItem("account", JSON.stringify({ address, txHash }));
  }

  updateAccountBalance(token, amount) {
    const balance = {
      token,
      amount,
    };
    this.accountBalances.push(balance);
  }

  addApproval(txHash) {
    this.approvals.push({ txHash });
  }

  addTransaction(txHash) {
    this.transactions.push({ txHash });
  }

  addNFTTransaction(txHash) {
    this.nftTransactions.push({ txHash });
  }

  addRecoveryEmail(txHash, email) {
    this.recoveryEmail = email;
    this.addRecoveryEmailTxHash = txHash;
    localStorage.setItem("account:email", JSON.stringify({ email, txHash }));
  }

  showSnackBar(message) {
    this.snackBarMessage =
      message.length > 100 ? `${message.slice(0, 100)}...` : message;
    this.openSnackBar = true;
  }

  reset() {
    this.openSnackBar = false;
    this.snackBarMessage = "";
    this.isInit = false;

    this.attachment = "auto";
    this.transports = ["hybrid", "internal"];
    this.createCredential = undefined;

    this.provider = undefined;
    this.signer = undefined;
    this.client = undefined;
    this.initAccountBuilder = undefined;
    this.newAccountBuilder = undefined;

    const passkey = sessionStorage.getItem("passkey");
    if (passkey) {
      const passkeyArray = JSON.parse(passkey);
      passkeyArray.forEach((key) => {
        sessionStorage.removeItem(key);
      });
    }
    sessionStorage.removeItem("passkey");
  }

  resetAccount() {
    this.accountAddress = "";
    this.recoveryEmail = "";
    this.accountBalances = [];
    this.approvals = [];
    this.transactions = [];
    this.nftTransactions = [];
    this.createAccountTxHash = "";
    this.addRecoveryEmailTxHash = "";
    localStorage.removeItem("account");
    localStorage.removeItem("account:email");
  }
}
