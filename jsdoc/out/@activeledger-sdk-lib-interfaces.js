/** 
 * @module @activeledger/sdk/lib/interfaces
 */

/**
 * @interface module:@activeledger/sdk/lib/interfaces.IBaseTransaction
 * @property {boolean} [$selfsign]
 * @property {any} $sigs
 * @property {module:@activeledger/sdk/lib/interfaces.ITxBody} $tx
 */
export class IBaseTransaction {
}

/**
 * @interface module:@activeledger/sdk/lib/interfaces.IHttpOptions
 * @property {any} [headers]
 * @property {string} hostname
 * @property {string} method
 * @property {string} path
 * @property {number} port
 */
export class IHttpOptions {
}

/**
 * @interface module:@activeledger/sdk/lib/interfaces.IKey
 * @property {string} [identity]
 * @property {module:C:/Git/ASL/SDKS/ActiveledgerSDK_NodeJS/node_modules/@activeledger/activecrypto/lib/crypto/keypair.KeyHandler} key
 * @property {string} type
 * @property {string} name
 */
export class IKey {
}

/**
 * @interface module:@activeledger/sdk/lib/interfaces.ILedgerResponse
 * @property {string} $umid
 * @property {module:@activeledger/sdk/lib/interfaces.ISummaryObject} $summary
 * @property {module:@activeledger/sdk/lib/interfaces.IStreamsObject} $streams
 */
export class ILedgerResponse {
}

/**
 * @interface module:@activeledger/sdk/lib/interfaces.INodeKeyData
 * @property {string} encryption
 * @property {string} pem
 */
export class INodeKeyData {
}

/**
 * @interface module:@activeledger/sdk/lib/interfaces.IOnboardTx
 * @extends module:@activeledger/sdk/lib/interfaces.IBaseTransaction
 * @property {boolean} $selfsign
 * @property {any} $sigs
 * @property {module:@activeledger/sdk/lib/interfaces.IOnboardTxBody} $tx
 */
export class IOnboardTx {
}

/**
 * @interface module:@activeledger/sdk/lib/interfaces.IOnboardTxBody
 * @property {string} $contract
 * @property {any} $i
 * @property {string} $namespace
 */
export class IOnboardTxBody {
}

