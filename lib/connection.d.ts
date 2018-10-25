import { IBaseTransaction, ILedgerResponse } from './interfaces';
export declare class Connection {
    private protocol;
    private address;
    private port;
    private protocolService;
    private httpOptions;
    private encryptedHeaders;
    constructor(protocol: string, address: string, portNumber: number);
    /**
     * Send a transaction to the specified ledger
     *
     * @param {IBaseTransaction} txBody - The Body of the transaction
     * @param {boolean} [encrypt] - Whether or not the transaction should be encrypted
     * @returns {Promise<ILedgerResponse>} Returns the response as a promise
     * @memberof Connection
     */
    sendTransaction(txBody: IBaseTransaction, encrypt?: boolean): Promise<ILedgerResponse>;
    /**
     * POST the provided transaction to the ledger
     *
     * @private
     * @param {(string | IBaseTransaction)} tx - The transaction to POST
     * @returns {Promise<ILedgerResponse>} Returns the ledger response
     * @memberof Connection
     */
    private postTransaction;
    /**
     * Encrypts the transaction if required
     *
     * @private
     * @param {IBaseTransaction} txBody - The transaction to encrypt
     * @returns {Promise<string>} Returns the encrypted data as a string
     * @memberof Connection
     */
    private encrypt;
    /**
     * Get the key data from the node specified in the connection
     *
     * @private
     * @returns {Promise<INodeKeyData>} Returns the key data as a promise
     * @memberof Connection
     */
    private getNodeKeyData;
}
