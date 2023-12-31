import { BigNumber } from "ethers";
import { arrayify, defaultAbiCoder } from "ethers/lib/utils";
import { utils } from "@passwordless-id/webauthn";

import {
  castASN1SignatureToRawRS,
  hexToArrayBuffer,
  uint8ArrayToHex,
} from "../utils";
import { authenticate } from "../utils/webAuthn";

export class WebAuthnSigner {
  transports;
  addr;
  credential;
  credentialId;
  publicKey;

  constructor(transports, address, credential, credentialId, publicKey) {
    console.log("credentialId", credentialId);
    this.transports = transports;
    this.addr = address;
    this.credential = credential;
    this.credentialId = credentialId;
    this.publicKey = publicKey;
  }

  signatureLength() {
    return 1152;
  }

  address() {
    return this.addr;
  }

  async data() {
    const bufferX = Buffer.from(
      utils.parseBase64url(this.publicKey.x.toString())
    );
    const bufferY = Buffer.from(
      utils.parseBase64url(this.publicKey.y.toString())
    );
    const bytes = defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [BigNumber.from(bufferX), BigNumber.from(bufferY)]
    );
    const data = defaultAbiCoder.encode(
      ["bytes", "string", "string"],
      [bytes, this.credentialId, ""]
    );
    return data;
  }

  shouldRemoveLeadingZero(bytes) {
    return bytes[0] === 0x0 && (bytes[1] & (1 << 7)) !== 0;
  }

  async sign(opHash) {
    const challenge = utils.toBase64url(arrayify(opHash)).replace(/=/g, "");
    console.log("challenge", challenge);
    console.log("create credential", this.credential);
    const challengeBuffer = utils.parseBase64url(challenge);
    const response = await authenticate(
      challengeBuffer,
      hexToArrayBuffer(this.credentialId),
      this.transports
    );
    console.log("get credential", response.credential);
    const clientDataJSON = new TextDecoder().decode(
      utils.parseBase64url(
        utils.toBase64url(response.credential.clientDataJSON)
      )
    );
    const challengePos = clientDataJSON.indexOf(challenge);
    const challengePrefix = clientDataJSON.substring(0, challengePos);
    const challengeSuffix = clientDataJSON.substring(
      challengePos + challenge.length
    );
    const authenticatorData = new Uint8Array(
      response.credential.authenticatorData
    );

    const parsedSignature = castASN1SignatureToRawRS(
      response.credential.signature
    );
    let rBytes = parsedSignature.r;
    let sBytes = parsedSignature.s;
    if (this.shouldRemoveLeadingZero(rBytes)) {
      rBytes = rBytes.slice(1);
    }
    if (this.shouldRemoveLeadingZero(sBytes)) {
      sBytes = sBytes.slice(1);
    }
    const signature = defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [BigNumber.from(rBytes), BigNumber.from(sBytes)]
    );

    console.log(
      "signature",
      signature,
      "authenticatorData",
      uint8ArrayToHex(authenticatorData),
      "challengePrefix",
      challengePrefix,
      "challengeSuffix",
      challengeSuffix,
      "credentialId",
      this.credentialId
    );
    const data = defaultAbiCoder.encode(
      ["bytes", "bytes", "string", "string", "string"],
      [
        signature,
        authenticatorData,
        challengePrefix,
        challengeSuffix,
        this.credentialId,
      ]
    );
    console.log("sign data", data);
    return data;
  }
}
