import { makeAutoObservable } from "mobx";

export default class AppStore {
  rootStore;
  openSnackBar = false;
  snackBarMessage = "";
  isInit = false;

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  initialize() {
    this.isInit = true;
  }

  dispose() {
    this.isInit = false;
  }
}
