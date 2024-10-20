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

const litNodeClient = new LitNodeClient({
  litNetwork: LitNetwork.DatilDev,
  debug: false
});
await litNodeClient.connect();

const ethersWallet = new ethers.Wallet(
  process.env.ETHEREUM_PRIVATE_KEY, // Replace with your private key
  new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

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
 const message = 'Hello world';
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

console.log("Cipher text:", ciphertext, "hash:", dataToEncryptHash);

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

const litActionCode = code;

const response = await litNodeClient.executeJs({
  sessionSigs: sessionSignatures,
  code: litActionCode,
  jsParams: {
    msg: msg,
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
console.log("Decrypted Secret Message: ", decryptionResult);