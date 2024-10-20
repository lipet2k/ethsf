import { LitNodeClient, encryptString, decryptToString } from "@lit-protocol/lit-node-client";
import { LitNetwork, LIT_RPC } from "@lit-protocol/constants";
import * as ethers from "ethers";
import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitActionResource,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";

import * as LitJsSdk from "@lit-protocol/lit-node-client";

import { ml_dsa44, ml_dsa65, ml_dsa87 } from '@noble/post-quantum/ml-dsa';

import { LitContracts } from "@lit-protocol/contracts-sdk";

import code from './src/dist/vanilla.js';

import crypto from 'crypto';

// Generate ECDSA key pair using the prime256v1 curve (P-256)
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'P-256', // Can use other curves like 'secp256k1'
  publicKeyEncoding: {
    type: 'spki', // Public Key Cryptography Standards (SPKI)
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8', // Private Key Cryptography Standards (PKCS8)
    format: 'pem',
  },
});

console.log("Public Key:\n", publicKey);
console.log("Private Key:\n", privateKey);

// Sign a message
const message = 'Hello World!';
const sign = crypto.createSign('SHA256');
sign.update(message);
sign.end();

const signature = sign.sign(privateKey, 'hex'); // Signature in hex format
console.log("Signature:", signature);

const litNodeClient = new LitNodeClient({
  litNetwork: LitNetwork.DatilDev,
  debug: false
});
await litNodeClient.connect();

const ethersWallet = new ethers.Wallet(
  process.env.ETHEREUM_PRIVATE_KEY, // Replace with your private key
  new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

const litContracts = new LitContracts({
  signer: ethersWallet,
  network: LitNetwork.DatilDev,
  debug: false
});
await litContracts.connect();

const pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;

const sessionSignatures = await litNodeClient.getSessionSigs({
  chain: "sepolia",
  expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
  resourceAbilityRequests: [
    {
      resource: new LitActionResource("*"),
      ability: LitAbility.LitActionExecution,
    },
  ],
  authNeededCallback: async ({
    uri,
    expiration,
    resourceAbilityRequests,
  }) => {
    const toSign = await createSiweMessage({
      uri,
      expiration,
      resources: resourceAbilityRequests,
      walletAddress: await ethersWallet.getAddress(),
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    return await generateAuthSig({
      signer: ethersWallet,
      toSign,
    });
  },
});

const chain = 'sepolia';
const accessControlConditions = [
   {
     contractAddress: '',
     standardContractType: '',
     chain,
     method: 'eth_getBalance',
     parameters: [':userAddress', 'latest'],
     returnValueTest: {
       comparator: '>=',
       value: '0',
     },
   },
 ];
 const client = new LitNodeClient({
   litNetwork: "datil-dev"
 });
 await client.connect();
 const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
   {
     accessControlConditions,
     sessionSigs: sessionSignatures,
     chain,
     dataToEncrypt: message,
   },
   client
 );

const sessionSigs = await litNodeClient.getSessionSigs({
  chain: "ethereum",
  expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
  resourceAbilityRequests: [
      {
          resource: new LitAccessControlConditionResource(
              await LitAccessControlConditionResource.generateResourceString(
                  accessControlConditions,
                  dataToEncryptHash
              )
          ),
          ability: LitAbility.AccessControlConditionDecryption,
      },
  ],
  authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
      }) => {
      const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: ethersWallet.address,
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
      });

      return await generateAuthSig({
          signer: ethersWallet,
          toSign,
      });
  },
});

const signingResult = await litNodeClient.pkpSign({
  pubKey: pkpInfo.publicKey,
  sessionSigs,
  toSign: ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("The answer to the universe is 42.")
    )
  ),
});

const litActionCode = code;

const response = await litNodeClient.executeJs({
  sessionSigs: sessionSignatures,
  code: litActionCode,
  jsParams: {
    publicKey: publicKey,
    msg: message,
    sig: signature
  }
});

const decryptionResult = await decryptToString(
  {
      chain: "sepolia",
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
      sessionSigs,
  },
  litNodeClient
);

console.log(response);