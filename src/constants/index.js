export const attachmentOptions = [
  { label: "Auto", value: "auto" },
  { label: "Platform", value: "platform" },
  { label: "Cross Platform", value: "cross-platform" },
];

export const transportOptions = [
  { label: "USB", value: "usb" },
  { label: "Bluetooth", value: "ble" },
  { label: "NFC", value: "nfc" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Platform", value: "internal" },
];

// sepolia network
export const chainId = 11155111;
export const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const webAuthnValidatorAddress =
  "0x0a35a307F986cF81260c751dD5B2ca562fB2C967";
export const accountFactoryAddress =
  "0x568Fb62bdE3a57DDaE917d5219A3D73B059402F7";
export const tokenApprovalAddress =
  "0x22C1317FE43132b22860e8b465548613d6151a9F";
export const nftAddress = "0x110644b2757A536be48A2880Ea439e895260d654";
export const sepoliaRpcUrl =
  "https://sepolia.infura.io/v3/b9794ad1ddf84dfb8c34d6bb5dca2001"; // "https://eth-sepolia.public.blastapi.io";
export const bundlerUrl = "http://43.134.168.120:8089/rpc/bundler";
export const paymasterUrl = "http://43.134.168.120:8089/rpc/1";

export const ERC20ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export const challenge = new Uint8Array([
  81, 50, 74, 28, 9, 109, 229, 71, 0, 51, 188, 87, 180, 74, 45, 170, 155, 31,
  173, 158, 197, 49, 246, 161, 162, 230, 195, 180, 212, 250, 203, 185,
]);
export const user = {
  id: Uint8Array.from("dennis.lee", (c) => c.charCodeAt(0)),
  name: "dennis.lee@okg.com",
  displayName: "Dennis Lee",
};