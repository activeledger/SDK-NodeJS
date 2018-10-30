/** 
 * @module @activeledger/sdk/lib/transaction
 */

/**
 */
export class TransactionHandler {
  /**
   * Internal use
   * Build a key onboarding transaction
   * @param {module:@activeledger/sdk/lib/interfaces.IKey} key The key to onboard
   * @param {string} contract
   * @param {string} namespace
   * @function module:@activeledger/sdk/lib/transaction.TransactionHandler#buildOnboardKeyTx
   * @returns {Promise<module:@activeledger/sdk/lib/interfaces.IOnboardTx>}
   */
  buildOnboardKeyTx() {}

  /**
   * Send a transaction to the ledger
   * @memberof Transaction
   * @param {module:@activeledger/sdk/lib/interfaces.IBaseTransaction | module:@activeledger/sdk/lib/interfaces.IOnboardTx} tx The transaction to send
   * @param {module:@activeledger/sdk/lib/connection.Connection} connection The connection to send the transaction over
   * @function module:@activeledger/sdk/lib/transaction.TransactionHandler#sendTransaction
   * @returns {Promise<module:@activeledger/sdk/lib/interfaces.ILedgerResponse>} Returns the ledger response
   */
  sendTransaction() {}

  /**
   * Sign the provided transaction and add it to the body
   * @memberof TransactionHandler
   * @param {module:@activeledger/sdk/lib/interfaces.IBaseTransaction} txBody The transaction to sign
   * @param {module:@activeledger/sdk/lib/interfaces.IKey} key The key to use to sign
   * @function module:@activeledger/sdk/lib/transaction.TransactionHandler#signTransaction
   * @returns {Promise<module:@activeledger/sdk/lib/interfaces.IBaseTransaction>} Returns the transaction with its signature
   */
  signTransaction() {}
}

