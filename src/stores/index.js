import { createContext, useContext } from "react";

import AppStore from "./appStore.js";

export class RootStore {
  constructor() {
    this.appStore = new AppStore(this);
  }
}

export const StoreContext = createContext(new RootStore());

export const useStore = () => {
  return useContext(StoreContext);
};
