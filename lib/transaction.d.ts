import { IBaseTransaction, IKey, ILedgerResponse, IOnboardTx } from "./interfaces";
export declare class Transaction {
    private contract;
    private namespace;
    /**
     * Internal use
     * Build a key onboarding transaction
     *
     * @param {IKey} key - The key to onboard
     * @param {string} [contract] - Optional: The contract to run the transaction against
     * @param {string} [namespace] - Optional: The namespace to run the transaction against
     * @returns {Promise<IOnboardTx>} Returns the built transaction
     * @memberof Transaction
     */
    onboardKey(key: IKey, contract?: string, namespace?: string): Promise<IOnboardTx>;
    /**
     * Send a transaction to the ledger
     *
     * @param {(IBaseTransaction | IOnboardTx)} tx - The transaction to send
     * @param {string} protocol - http or https
     * @param {string} address - The IP address or domain name e.g 0.0.0.0 or www.example.com
     * @param {number} port - The port to use
     * @returns {Promise<ILedgerResponse>} Returns the ledger response
     * @memberof Transaction
     */
    sendTransaction(tx: IBaseTransaction | IOnboardTx, protocol: string, address: string, port: number): Promise<ILedgerResponse>;
}
