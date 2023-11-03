import { makeAutoObservable } from "mobx";
import { Client, Presets } from "userop";
import { SmartAccount } from "smart-accounts";

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
} from "../constants";
export default class AppStore {
  rootStore;

  openSnackBar = false;
  snackBarMessage = "";
  isInit = false;

  attachment = "auto";
  transports = ["hybrid", "internal"];
  createCredential;
  publicKey;

  signer;
  client;
  initAccountBuilder;
  newAccountBuilder;
  createAccountTxHash = "";
  accountAddress = "";
  accountBalance = 0;

  approves = [];
  transactions = [];
  nftTransactions = [];
  addRecoveryEmailTxHash = "";

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  async initialize() {
    try {
      const { credential, publicKey } = await createPasskey(this.attachment);
      this.createCredential = credential;
      this.publicKey = publicKey;
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

  dispose() {
    this.isInit = false;
  }
}
