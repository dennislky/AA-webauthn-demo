import { makeAutoObservable } from "mobx";
import { Decoder } from "cbor-web";

import { base64url } from "rfc4648";

function Uint8ArrayToBuffer(array) {
  return array.buffer.slice(
    array.byteOffset,
    array.byteLength + array.byteOffset
  );
}

async function sha256Hash(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  // const hashArray = Array.from(new Uint8Array(hashBuffer));
  // const hashHex = hashArray
  //   .map((bytes) => bytes.toString(16).padStart(2, "0"))
  //   .join("");
  return hashBuffer;
}

async function verify(data, signature, publicKey) {
  return window.crypto.subtle
    .importKey("jwk", publicKey, { name: "ECDSA", namedCurve: "P-256" }, true, [
      "verify",
    ])
    .then((key) => {
      console.log(key);
      window.crypto.subtle
        .verify(
          { name: "ECDSA", hash: "SHA-256" },
          key,
          // base64url.parse(signature, { loose: true }),
          signature,
          data
        )
        .then((isValid) => alert(isValid ? "Valid token" : "Invalid token"));
    });
}

export default class AppStore {
  rootStore;
  openSnackBar = false;
  snackBarMessage = "";
  isInit = false;
  credentialId;
  publicKey;

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  async initialize() {
    const publicKeyCredentialCreationOptions = {
      challenge: Uint8Array.from("testing", (c) => c.charCodeAt(0)),
      rp: {
        name: "OKX",
        id: "localhost",
      },
      user: {
        id: Uint8Array.from("dennis.lee@okg.com", (c) => c.charCodeAt(0)),
        name: "dennis.lee@okg.com",
        displayName: "Dennis Lee",
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
      },
      timeout: 60000,
      attestation: "direct",
    };
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });
    console.log(credential);

    // decode the clientDataJSON into a utf-8 string
    const utf8Decoder = new TextDecoder("utf-8");
    const decodedClientData = utf8Decoder.decode(
      credential.response.clientDataJSON
    );

    // parse the string as an object
    const clientDataObj = JSON.parse(decodedClientData);
    console.log(clientDataObj);

    // note: a CBOR decoder library is needed here.
    const decodedAttestationObj = Decoder.decodeFirstSync(
      credential.response.attestationObject
    );
    console.log(decodedAttestationObj);

    const { authData } = decodedAttestationObj;

    // get the length of the credential ID
    const dataView = new DataView(new ArrayBuffer(2));
    const idLenBytes = authData.slice(53, 55);
    idLenBytes.forEach((value, index) => dataView.setUint8(index, value));
    const credentialIdLength = dataView.getUint16();

    // get the credential ID
    const credentialId = authData.slice(55, 55 + credentialIdLength);
    this.credentialId = credentialId;
    console.log(credentialId);

    // get the public key object
    const publicKeyBytes = authData.slice(55 + credentialIdLength);

    // the publicKeyBytes are encoded again as CBOR
    const publicKeyObject = Decoder.decodeFirstSync(
      Uint8ArrayToBuffer(publicKeyBytes)
    );
    this.publicKey = publicKeyObject;
    console.log(publicKeyObject);

    this.isInit = true;
  }

  async getWebAuthn() {
    const publicKeyCredentialRequestOptions = {
      challenge: Uint8Array.from("testing", (c) => c.charCodeAt(0)),
      allowCredentials: [
        {
          id: this.credentialId,
          type: "public-key",
          transports: ["ble", "nfc", "hybrid", "internal"],
        },
      ],
      timeout: 60000,
    };

    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });
    console.log(credential);

    // decode the clientDataJSON into a utf-8 string
    const utf8Decoder = new TextDecoder("utf-8");
    const decodedClientData = utf8Decoder.decode(
      credential.response.clientDataJSON
    );

    // parse the string as an object
    const clientDataObj = JSON.parse(decodedClientData);
    console.log(clientDataObj);

    const authenticatorData = credential.response.authenticatorData;
    console.log(authenticatorData);

    const hash = await sha256Hash(credential.response.clientDataJSON);
    console.log(hash);

    const dataTypedArray = new Uint8Array(
      authenticatorData.byteLength + hash.byteLength
    );
    dataTypedArray.set(new Uint8Array(authenticatorData), 0);
    dataTypedArray.set(new Uint8Array(hash), authenticatorData.byteLength);
    console.log(dataTypedArray);

    const publicKeyArray = Array.from(this.publicKey);
    console.log(publicKeyArray);
    const bufferX = new Uint8Array(Uint8ArrayToBuffer(publicKeyArray[3][1]));
    const bufferY = new Uint8Array(Uint8ArrayToBuffer(publicKeyArray[4][1]));
    console.log(bufferX, bufferY);
    const x = base64url.stringify(bufferX, { pad: false });
    const y = base64url.stringify(bufferY, { pad: false });
    console.log(x, y);
    const jwk = {
      crv: "P-256",
      ext: true,
      // key_ops: ["verify"],
      kty: "EC",
      x,
      y,
      // alg: "ES256",
    };
    await verify(dataTypedArray.buffer, credential.response.signature, jwk);
  }

  dispose() {
    this.isInit = false;
  }
}
