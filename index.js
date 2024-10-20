import { LitNetwork } from "@lit-protocol/constants";

app.locals.litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
  alertWhenUnauthorized: false,
  litNetwork: LitNetwork.Datil,
});
await app.locals.litNodeClient.connect();

const chain = 'ethereum';
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
     sessionSigs: {}, // your session
     chain,
     dataToEncrypt: message,
   },
   client
 );

 console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);

 