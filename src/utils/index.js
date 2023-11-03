import { base64url } from "rfc4648";

function uint8ArrayToHex(buffer) {
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToUint8Array(hex) {
  const typedArray = new Uint8Array(
    hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    })
  );
  return typedArray;
}

function hexToArrayBuffer(hex) {
  const typedArray = new Uint8Array(
    hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16);
    })
  );
  return typedArray.buffer;
}

function castUint8ArrayToArrayBuffer(array) {
  return array.buffer.slice(
    array.byteOffset,
    array.byteLength + array.byteOffset
  );
}

async function importKeyAsSPKI(publicKey) {
  return crypto.subtle.importKey(
    "spki",
    publicKey,
    {
      name: "ECDSA",
      namedCurve: "P-256",
      hash: { name: "SHA-256" },
    },
    false,
    ["verify"]
  );
}

async function importKeyAsJWK(publicKey) {
  return window.crypto.subtle.importKey(
    "jwk",
    publicKey,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"]
  );
}

function castPublicKeyToJWKObject(publicKey) {
  // cast the COSE public key object to JWK
  const publicKeyArray = Array.from(publicKey);
  // console.log("publicKeyArray", publicKeyArray);
  const bufferX = new Uint8Array(
    castUint8ArrayToArrayBuffer(publicKeyArray[3][1])
  );
  const bufferY = new Uint8Array(
    castUint8ArrayToArrayBuffer(publicKeyArray[4][1])
  );
  // console.log("coordinates buffer", bufferX, bufferY);
  // x & y coordinates of the public key are encoded as base64url in JWK (RFC-7518)
  const x = base64url.stringify(bufferX, { pad: false });
  const y = base64url.stringify(bufferY, { pad: false });
  // console.log("coordinates", x, y);
  const jwk = {
    crv: "P-256",
    kty: "EC",
    x,
    y,
    // ext: true,
    // kid: "",
    // key_ops: ["verify"],
    // alg: "ES256",
  };
  return jwk;
}

async function castPublicKeyToJWK(publicKey) {
  const jwk = castPublicKeyToJWKObject(publicKey);
  // cast JWK to CryptoKey
  const publicKeyJWK = await importKeyAsJWK(jwk);
  console.log("publicKeyJWK", publicKeyJWK);
  return publicKeyJWK;
}

async function castJWKObjectToCrytpoKey(jwk) {
  // cast JWK to CryptoKey
  const publicKeyJWK = await importKeyAsJWK(jwk);
  console.log("publicKeyJWK", publicKeyJWK);
  return publicKeyJWK;
}

function castASN1SignatureToRawRS(signature) {
  // Convert signature from ASN.1 format to raw format
  const originSignature = new Uint8Array(signature);
  const rStart = originSignature[4] === 0 ? 5 : 4;
  const rEnd = rStart + 32;
  const sStart = originSignature[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;
  const r = originSignature.slice(rStart, rEnd);
  const s = originSignature.slice(sStart);
  return { r, s };
}

function castASN1ToRawSignature(signature) {
  const { r, s } = castASN1SignatureToRawRS(signature);
  const rawSignature = new Uint8Array([...r, ...s]);
  console.log("rawSignature", rawSignature);
  return rawSignature.buffer;
}

async function verify(data, signature, publicKey) {
  return window.crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    publicKey,
    signature,
    data
  );
}

export {
  uint8ArrayToHex,
  arrayBufferToHex,
  hexToUint8Array,
  hexToArrayBuffer,
  castUint8ArrayToArrayBuffer,
  importKeyAsJWK,
  importKeyAsSPKI,
  castPublicKeyToJWK,
  castPublicKeyToJWKObject,
  castJWKObjectToCrytpoKey,
  castASN1ToRawSignature,
  castASN1SignatureToRawRS,
  verify,
};
