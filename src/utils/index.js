import { base64url } from "rfc4648";

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

async function castPublicKeyToJWK(publicKey) {
  // cast the COSE public key object to JWK
  const publicKeyArray = Array.from(publicKey);
  console.log("publicKeyArray", publicKeyArray);
  const bufferX = new Uint8Array(
    castUint8ArrayToArrayBuffer(publicKeyArray[3][1])
  );
  const bufferY = new Uint8Array(
    castUint8ArrayToArrayBuffer(publicKeyArray[4][1])
  );
  console.log("coordinates buffer", bufferX, bufferY);
  // x & y coordinates of the public key are encoded as base64url in JWK (RFC-7518)
  const x = base64url.stringify(bufferX, { pad: false });
  const y = base64url.stringify(bufferY, { pad: false });
  console.log("coordinates", x, y);
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
  // cast JWK to CryptoKey
  const publicKeyJWK = await importKeyAsJWK(jwk);
  console.log("publicKeyJWK", publicKeyJWK);
  return publicKeyJWK;
}

function castASN1ToRawSignature(signature) {
  // Convert signature from ASN.1 format to raw format
  const originSignature = new Uint8Array(signature);
  console.log("originSignature", originSignature);
  const rStart = originSignature[4] === 0 ? 5 : 4;
  const rEnd = rStart + 32;
  const sStart = originSignature[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;
  const r = originSignature.slice(rStart, rEnd);
  const s = originSignature.slice(sStart);
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
  castUint8ArrayToArrayBuffer,
  importKeyAsJWK,
  importKeyAsSPKI,
  castPublicKeyToJWK,
  castASN1ToRawSignature,
  verify,
};
