/** 
 * @module @activeledger/sdk/lib/key
 */

/**
 */
export class KeyHandler {
  /**
   * Generate a new key
   * @memberof KeyHandler
   * @param {string} keyName The name of the key
   * @param {module:@activeledger/sdk/lib/enums.KeyType} keyType The type of Key to generate
   * @function module:@activeledger/sdk/lib/key.KeyHandler#generateKey
   * @returns {Promise<module:@activeledger/sdk/lib/interfaces.IKey>} Returns the Key Object
   */
  generateKey() {}

  /**
   * Onboard a key to the ledger and assign an identity to the key
   * @memberof KeyHandler
   * @param {module:@activeledger/sdk/lib/interfaces.IKey} key The key to onboard
   * @param {module:@activeledger/sdk/lib/connection.Connection} connection The connection to send the transaction over
   * @function module:@activeledger/sdk/lib/key.KeyHandler#onboardKey
   * @returns {Promise<module:@activeledger/sdk/lib/interfaces.ILedgerResponse>} Returns Ledger response as a promise
   */
  onboardKey() {}
}

