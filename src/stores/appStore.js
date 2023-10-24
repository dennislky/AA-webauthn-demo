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
        .verify({ name: "ECDSA", hash: "SHA-256" }, key, signature, data)
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
      // challenge: The challenge is a buffer of cryptographically random bytes generated on the server, and is needed to prevent "replay attacks".
      challenge: Uint8Array.from("testing", (c) => c.charCodeAt(0)),
      // rp: This stands for “relying party”; it can be considered as describing the organization responsible for registering and authenticating the user.
      // The id must be a subset of the domain currently in the browser.
      rp: {
        name: "OKX",
        id: "localhost",
      },
      // user: This is information about the user currently registering. The authenticator uses the id to associate a credential with the user.
      // It is suggested to not use personally identifying information as the id, as it may be stored in an authenticator.
      user: {
        id: Uint8Array.from("dennis.lee@okg.com", (c) => c.charCodeAt(0)),
        name: "dennis.lee@okg.com",
        displayName: "Dennis Lee",
      },
      // pubKeyCredParams: This is an array of objects describing what public key types are acceptable to a server.
      // The alg is a number described in the COSE registry; for example, -7 indicates that the server accepts Elliptic Curve public keys using a SHA-256 signature algorithm.
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      // authenticatorSelection: This optional object helps relying parties make further restrictions on the type of authenticators allowed for registration.
      // In this example we are indicating we want to register a cross-platform authenticator (like a Yubikey) instead of a platform authenticator like Windows Hello or Touch ID.
      authenticatorSelection: {
        authenticatorAttachment: "platform",
      },
      // timeout: The time (in milliseconds) that the user has to respond to a prompt for registration before an error is returned.
      timeout: 60000,
      // attestation: The attestation data that is returned from the authenticator has information that could be used to track users.
      // This option allows servers to indicate how important the attestation data is to this registration event.
      // A value of "none" indicates that the server does not care about attestation.
      // A value of "indirect" means that the server will allow for anonymized attestation data.
      // A value of "direct" means that the server wishes to receive the attestation data from the authenticator.
      attestation: "direct",
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });
    /* PublicKeyCredential {
      // id: The ID for the newly generated credential; it will be used to identify the credential when authenticating the user. 
      // The ID is provided here as a base64-encoded string.
      id: 'ADSUllKQmbqdGtpu4sjseh4cg2TxSvrbcHDTBsv4NSSX9...',
      // rawId: The ID again, but in binary form.
      rawId: ArrayBuffer(59),
      // clientDataJSON: This represents data passed from the browser to the authenticator in order to associate the new credential with the server and browser. 
      // The authenticator provides it as a UTF-8 byte array.
      response: AuthenticatorAttestationResponse {
          clientDataJSON: ArrayBuffer(121),
          attestationObject: ArrayBuffer(306),
      },
      // attestationObject: This object contains the credential public key, an optional attestation certificate, and other metadata used also to validate the registration event. 
      // It is binary data encoded in CBOR.
      type: 'public-key'
    } */
    console.log(credential);

    // decode the clientDataJSON into a utf-8 string
    const utf8Decoder = new TextDecoder("utf-8");
    const decodedClientData = utf8Decoder.decode(
      credential.response.clientDataJSON
    );
    // parse the string as an object
    const clientDataObj = JSON.parse(decodedClientData);
    // The clientDataJSON is parsed by converting the UTF-8 byte array provided by the authenticator into a JSON-parsable string.
    // On this server, this (and the other PublicKeyCredential data) will be verified to ensure that the registration event is valid.
    /* {
      // challenge: This is the same challenge that was passed into the create() call. The server must validate that this returned challenge matches the one generated for this registration event.
      challenge: "p5aV2uHXr0AOqUk7HQitvi-Ny1....",
      // origin: The server must validate that this "origin" string matches up with the origin of the application.
      origin: "https://webauthn.guide",
      // type: The server validates that this string is in fact "webauthn.create". If another string is provided, it indicates that the authenticator performed an incorrect operation.
      type: "webauthn.create"
    } */
    console.log(clientDataObj);

    // note: a CBOR decoder library is needed here.
    const decodedAttestationObj = Decoder.decodeFirstSync(
      credential.response.attestationObject
    );
    /* {
      // authData: The authenticator data is here is a byte array that contains metadata about the registration event, as well as the public key we will use for future authentications.
      authData: Uint8Array(196),
      // fmt: This represents the attestation format. Authenticators can provide attestation data in a number of ways; this indicates how the server should parse and validate the attestation data.
      fmt: "fido-u2f",
      // attStmt: This is the attestation statement. This object will look different depending on the attestation format indicated. 
      // In this case, we are given a signature sig and attestation certificate x5c. Servers use this data to cryptographically verify the credential public key came from the authenticator. 
      // Additionally, servers can use the certificate to reject authenticators that are believed to be weak.
      attStmt: {
          sig: Uint8Array(70),
          x5c: Array(1),
      },
    } */
    console.log(decodedAttestationObj);

    // The authData is a byte array described in the spec. Parsing it will involve slicing bytes from the array and converting them into usable objects.
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

    // the publicKeyBytes are encoded again as CBOR, remarks: Uint8Array.buffer != ArrayBuffer, use Uint8ArrayToBuffer method to cast it
    const publicKeyObject = Decoder.decodeFirstSync(
      Uint8ArrayToBuffer(publicKeyBytes)
    );
    this.publicKey = publicKeyObject;

    /* The publicKeyObject retrieved at the end is an object encoded in a standard called COSE, which is a concise way to describe the credential public key and the metadata needed to use it.
      1: The 1 field describes the key type. The value of 2 indicates that the key type is in the Elliptic Curve format.
      3: The 3 field describes the algorithm used to generate authentication signatures. The -7 value indicates this authenticator will be using ES256.
      -1: The -1 field describes this key's "curve type". The value 1 indicates the that this key uses the "P-256" curve.
      -2: The -2 field describes the x-coordinate of this public key.
      -3: The -3 field describes the y-coordinate of this public key. */
    /* {
      1: 2,
      3: -7,
      -1: 1,
      -2: Uint8Array(32) ...
      -3: Uint8Array(32) ...
    } */
    console.log(publicKeyObject);

    this.isInit = true;
  }

  async getWebAuthn() {
    const publicKeyCredentialRequestOptions = {
      // challenge: Like during registration, this must be cryptographically random bytes generated on the server.
      challenge: Uint8Array.from("testing", (c) => c.charCodeAt(0)),
      // allowCredentials: This array tells the browser which credentials the server would like the user to authenticate with.
      // The credentialId retrieved and saved during registration is passed in here. The server can optionally indicate what transports it prefers, like USB, NFC, and Bluetooth.
      allowCredentials: [
        {
          id: this.credentialId,
          type: "public-key",
          transports: ["ble", "nfc", "hybrid", "internal"],
        },
      ],
      // timeout: Like during registration, this optionally indicates the time (in milliseconds) that the user has to respond to a prompt for authentication.
      timeout: 60000,
    };

    /* During authentication the user proves that they own the private key they registered with. 
      They do so by providing an assertion, which is generated by calling navigator.credentials.get() on the client. 
      This will retrieve the credential generated during registration with a signature included. */
    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });
    /* PublicKeyCredential {
      // id: The identifier for the credential that was used to generate the authentication assertion.
      id: 'ADSUllKQmbqdGtpu4sjseh4cg2TxSvrbcHDTBsv4NSSX9...',
      // rawId: The identifier again, but in binary form.
      rawId: ArrayBuffer(59),
      response: AuthenticatorAssertionResponse {
          // authenticatorData: The authenticator data is similar to the authData received during registration, with the notable exception that the public key is not included here.
          // It is another item used during authentication as source bytes to generate the assertion signature.
          authenticatorData: ArrayBuffer(191),
          // clientDataJSON: As during registration, the clientDataJSON is a collection of the data passed from the browser to the authenticator. 
          // It is one of the items used during authentication as the source bytes to generate the signature.
          clientDataJSON: ArrayBuffer(118),
          // signature: The signature generated by the private key associated with this credential. On the server, the public key will be used to verify that this signature is valid.
          signature: ArrayBuffer(70),
          // userHandle: This field is optionally provided by the authenticator, and represents the user.id that was supplied during registration. 
          // It can be used to relate this assertion to the user on the server. It is encoded here as a UTF-8 byte array.
          userHandle: ArrayBuffer(10),
      },
      type: 'public-key'
    } */
    console.log(credential);

    // decode the clientDataJSON into a utf-8 string
    const utf8Decoder = new TextDecoder("utf-8");
    const decodedClientData = utf8Decoder.decode(
      credential.response.clientDataJSON
    );

    // parse the string as an object
    const clientDataObj = JSON.parse(decodedClientData);
    console.log(clientDataObj);

    /* After the assertion has been obtained, it is sent to the server for validation. 
    After the authentication data is fully validated, the signature is verified using the public key stored in the database during registration. */
    /* Verification will look different depending on the language and cryptography library used on the server. However, the general procedure remains the same.
      The server retrieves the public key object associated with the user.
      The server uses the public key to verify the signature, which was generated using the authenticatorData bytes and a SHA-256 hash of the clientDataJSON. */
    // authenticatorData bytes
    const authenticatorData = credential.response.authenticatorData;
    console.log(authenticatorData);

    // SHA-256 hash of the clientDataJSON
    const hash = await sha256Hash(credential.response.clientDataJSON);
    console.log(hash);

    // concatenate authenticatorData and hash of the clientDataJSON
    const dataTypedArray = new Uint8Array(
      authenticatorData.byteLength + hash.byteLength
    );
    dataTypedArray.set(new Uint8Array(authenticatorData), 0);
    dataTypedArray.set(new Uint8Array(hash), authenticatorData.byteLength);
    console.log(dataTypedArray);

    // cast the COSE public key object to JWK
    const publicKeyArray = Array.from(this.publicKey);
    console.log(publicKeyArray);
    const bufferX = new Uint8Array(Uint8ArrayToBuffer(publicKeyArray[3][1]));
    const bufferY = new Uint8Array(Uint8ArrayToBuffer(publicKeyArray[4][1]));
    console.log(bufferX, bufferY);
    // x & y coordinates of the public key are encoded as base64url in JWK (RFC-7518)
    const x = base64url.stringify(bufferX, { pad: false });
    const y = base64url.stringify(bufferY, { pad: false });
    console.log(x, y);
    const jwk = {
      crv: "P-256",
      ext: true,
      kty: "EC",
      x,
      y,
      // key_ops: ["verify"],
      // alg: "ES256",
    };
    // verify the signature is correct or not
    await verify(dataTypedArray.buffer, credential.response.signature, jwk);
  }

  dispose() {
    this.isInit = false;
  }
}
