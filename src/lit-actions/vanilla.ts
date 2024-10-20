/**
 * The global ethers library (5.7.0) is available on Lit Action (Unbundled)
 * 
 * inject ./buffer.shim.js
 */
// import { createVerify } from 'crypto';

// (async () => {
//   const res = await Lit.Actions.runOnce({
//     waitForResponse: true,
//     name: '003-vanilla-test'
//   }, async () => {
//     const startTime = Date.now(); // Get the current time in milliseconds
//     const verify = createVerify('SHA256');
//     verify.update(message);
//     verify.end();
    
//     if (verify.verify(publicKey, signature, 'hex')) {
//         const endTime = Date.now();
//         return endTime - startTime;
//     } else {
//         const endTime = Date.now();
//         return endTime - startTime;
//     }
//   });

//   Lit.Actions.setResponse({
//     response: JSON.stringify({
//       success: true,
//       message: res,
//     })
//   });
// })();