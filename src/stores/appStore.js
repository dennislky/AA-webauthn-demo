import { makeAutoObservable } from "mobx";
import {
  authenticate,
  createPasskey,
  verifySignature,
} from "../utils/webAuthn";
import { challenge } from "../constants";

export default class AppStore {
  rootStore;
  openSnackBar = false;
  snackBarMessage = "";
  isInit = false;
  createCredential;
  publicKey;
  attachment = "platform";
  transports = ["internal"];
  createAccountTxHash = "";
  accountAddress = "";

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
      return true;
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

  dispose() {
    this.isInit = false;
  }
}
