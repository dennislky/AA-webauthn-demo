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
  publicKey;

  provider;
  signer;
  client;
  initAccountBuilder;
  newAccountBuilder;
  createAccountTxHash = "";
  accountAddress = "";
  accountBalances = [];

  approves = [];
  transactions = [];
  nftTransactions = [];
  addRecoveryEmailTxHash = "";

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
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
  }

  async initialize() {
    try {
      const passkey = localStorage.getItem("passkey");
      if (!passkey) {
        const { credential, publicKey } = await createPasskey(this.attachment);
        this.createCredential = credential;

        const newPublicKey = castPublicKeyToJWKObject(publicKey);
        this.publicKey = newPublicKey;

        const newCredential = {
          id: credential.id,
          type: credential.type,
          rawId: arrayBufferToHex(credential.rawId),
          response: {
            attestationObject: arrayBufferToHex(
              credential.response.attestationObject
            ),
            clientDataJSON: arrayBufferToHex(
              credential.response.clientDataJSON
            ),
          },
        };
        localStorage.setItem(
          `passkey:${arrayBufferToHex(credential.rawId)}`,
          JSON.stringify({
            credential: newCredential,
            publicKey: newPublicKey,
          })
        );
        localStorage.setItem(
          "passkey",
          JSON.stringify([`passkey:${arrayBufferToHex(credential.rawId)}`])
        );
      } else {
        const passkeyArray = JSON.parse(passkey);
        const passkeyObj = JSON.parse(localStorage.getItem(passkeyArray[0]));
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
        this.publicKey = passkeyObj.publicKey;
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
    if (!this.newAccountBuilder) {
      return this.createNewAccountBuilder();
    }
    return this.newAccountBuilder;
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
    this.createAccountTxHash = "";
    this.accountAddress = "";
    this.accountBalances = [];

    this.approves = [];
    this.transactions = [];
    this.nftTransactions = [];
    this.addRecoveryEmailTxHash = "";

    const passkey = localStorage.getItem("passkey");
    if (passkey) {
      const passkeyArray = JSON.parse(passkey);
      passkeyArray.forEach((key) => {
        localStorage.removeItem(key);
      });
    }
    localStorage.removeItem("passkey");
  }
}
