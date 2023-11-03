import { BigNumber } from "ethers";
import { arrayify, defaultAbiCoder } from "ethers/lib/utils";
import { utils } from "@passwordless-id/webauthn";

import { castASN1SignatureToRawRS, castPublicKeyToJWKObject } from "../utils";
import { authenticate } from "../utils/webAuthn";

export class WebAuthnSigner {
  transports;
  addr;
  credential;
  publicKey;

  constructor(transports, address, credential, publicKey) {
    this.transports = transports;
    this.addr = address;
    this.credential = credential;
    this.publicKey = publicKey;
  }

  signatureLength() {
    return 1280;
  }

  address() {
    return this.addr;
  }

  async data() {
    const jwk = await castPublicKeyToJWKObject(this.publicKey);
    console.log("jwk", jwk);
    const bufferX = Buffer.from(utils.parseBase64url(jwk.x.toString()));
    const bufferY = Buffer.from(utils.parseBase64url(jwk.y.toString()));
    // console.log(bufferX, bufferY);
    return defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [BigNumber.from(bufferX), BigNumber.from(bufferY)]
    );
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
      this.credential.rawId,
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
    // console.log(rBytes, sBytes);
    const signature = defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [BigNumber.from(rBytes), BigNumber.from(sBytes)]
    );

    console.log(signature, authenticatorData, challengePrefix, challengeSuffix);
    return defaultAbiCoder.encode(
      ["bytes", "bytes", "string", "string"],
      [signature, authenticatorData, challengePrefix, challengeSuffix]
    );
  }
}
