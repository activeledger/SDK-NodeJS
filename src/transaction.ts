/*
 * MIT License (MIT)
 * Copyright (c) 2019 Activeledger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { ActiveCrypto } from "@activeledger/activecrypto";
import { Connection } from "./connection";
import { IBaseTransaction, IKey, ILedgerResponse, IOnboardKeyTxOptions, IOnboardTx } from "./interfaces";

export class TransactionHandler {
  private contract = "onboard";
  private namespace = "default";

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
  public buildOnboardKeyTx(key: IKey, options?: IOnboardKeyTxOptions): Promise<IOnboardTx> {
    // If options not provided use the default values
    if (options) {
      if (options.contract) {
        this.contract = options.contract;
      }

      if (options.namespace) {
        this.namespace = options.namespace;
      }
    }

    // Build the transaction
    const tx: IOnboardTx = {
      $selfsign: true,
      $sigs: {},
      $tx: {
        $contract: this.contract,
        $i: {},
        $namespace: this.namespace,
      },
    };

    // Set the key data
    tx.$tx.$i[key.name] = {
      publicKey: (key.key.pub as any).pkcs8pem,
      type: key.type,
    };

    // Return the signTransaction promise
    return this.signTransaction<IOnboardTx>(tx, key);
  }

  /**
   * Sign the provided transaction and add it to the body
   *
   * @template T extends IBaseTransaction
   * @param {(T | string)} txBody - The transaction to sign
   * @param {IKey} key - The key to use to sign
   * @returns {(Promise<T | string>)} Returns the transaction with its signature, or if a string txBody is provided the signature is returned
   * @memberof TransactionHandler
   */
  public signTransaction(txBody: string, key: IKey): Promise<string>;
  public signTransaction<T extends IBaseTransaction>(txBody: T, key: IKey): Promise<T>;
  public signTransaction<T extends IBaseTransaction>(txBody: T | string, key: IKey): Promise<T | string> {
    return new Promise((resolve, reject) => {
      try {
        const keyPair = new ActiveCrypto.KeyPair(key.type, (key.key.prv as any).pkcs8pem);

        // Check the transaction type
        if (typeof txBody === "string") {
          return resolve(keyPair.sign(txBody));
        } else {
          let identifier = key.name;

          if (key.identity) {
            identifier = key.identity;
          }

          txBody.$sigs[identifier] = keyPair.sign(txBody.$tx);

          return resolve(txBody);
        }
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * Send a transaction to the ledger
   *
   * @param {(T extends IBaseTransaction)} tx - The transaction to send
   * @param {Connection} connection - The connection to send the transaction over
   * @returns {Promise<ILedgerResponse>} Returns the ledger response
   * @memberof Transaction
   */
  public sendTransaction<T extends IBaseTransaction>(tx: T, connection: Connection): Promise<ILedgerResponse> {
    return connection.sendTransaction(tx);
  }
}
