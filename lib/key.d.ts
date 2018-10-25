import { KeyType } from "./enums";
import { IKey, ILedgerResponse } from './interfaces';
export declare class KeyHandler {
    /**
     * Generate a new key
     *
     * @param {string} keyName - The name of the key
     * @param {KeyType} keyType - The type of Key to generate
     * @returns {Promise<IKey>} Returns the Key Object
     * @memberof KeyHandler
     */
    generateKey(keyName: string, keyType: KeyType): Promise<IKey>;
    /**
     * Onboard a key to the ledger
     *
     * @param {IKey} key - The key to onboard
     * @param {string} protocol - http or https
     * @param {string} address - The IP address or domain name e.g 0.0.0.0 or www.example.com
     * @param {number} port - The port to use
     * @returns {Promise<ILedgerResponse>} Returns Ledger response as a promise
     * @memberof KeyHandler
     */
    onboardKey(key: IKey, protocol: string, address: string, port: number): Promise<ILedgerResponse>;
}
