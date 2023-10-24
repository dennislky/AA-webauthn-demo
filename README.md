# Getting Started with OKX AA WebAuthn Demo

## WebAuthn Steps

1. [Server returns attestation options](https://webauthn-open-source.github.io/fido2-lib/Fido2Lib.html#attestationOptions)
2. Client create passkey per returned attestation options
3. [Server validates challenge, origin, factor](https://webauthn-open-source.github.io/fido2-lib/Fido2Lib.html#attestationOptions)
4. Server responses to client the attestation result

5. [Server returns assertion options](https://webauthn-open-source.github.io/fido2-lib/Fido2Lib.html#assertionOptions)
6. Client get passkey per returned assertion options
7. [Server validates challenge, origin, factor, public key, prevCounter and optionally userHandle](https://webauthn-open-source.github.io/fido2-lib/Fido2Lib.html#assertionResult)
8. Server responses to client the assertion result

## Link references

1. [FIDO Passkeys](https://fidoalliance.org/passkeys/)
2. [WebAuthn Guide](https://webauthn.guide/)
3. [Passwordless login with passkeys](https://developers.google.com/identity/passkeys)
4. [Passkeys developer guide for relying parties](https://developers.google.com/identity/passkeys/developer-guide)
5. [Passkey support on different platforms](https://developers.google.com/identity/passkeys/supported-environments)
6. [Configure WebAuthn with Device Biometrics for MFA](https://auth0.com/docs/secure/multi-factor-authentication/fido-authentication-with-webauthn/configure-webauthn-device-biometrics-for-mfa)
7. [WebAuthn Spec](https://w3c.github.io/webauthn/)
8. [WebAuthn FIDO2 Library](https://webauthn-open-source.github.io/fido2-lib/index.html)
9. [ECDSA mathematics explanation](https://cryptobook.nakov.com/digital-signatures/ecdsa-sign-verify-messages)
10. [COSE parsing](https://webauthn-open-source.github.io/fido2-lib/keyUtils.js.html)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
