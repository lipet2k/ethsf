/**
 * The global ethers library (5.7.0) is available on Lit Action (Unbundled)
 * 
 * inject ./buffer.shim.js
 */
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa';

(async () => {

  const res = await Lit.Actions.runOnce({
    waitForResponse: true,
    name: '001-post-quantum-bundling'
  }, async () => {
    const pkArray = new Uint8Array(publicKey);
    const msgArray = new Uint8Array(msg);
    const sigArray = new Uint8Array(sig);
    if (ml_dsa65.verify(pkArray, msgArray, sigArray)) {
        return "Successfully Verified PQ Signature!";
    } else {
        return "Verification Failed!"
    }
  });

  Lit.Actions.setResponse({
    response: JSON.stringify({
      success: true,
      message: res,
    })
  });
})();