/*
 * MIT License (MIT)
 * Copyright (c) 2018 Activeledger
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
import { IBaseTransaction, IKey, ILedgerResponse, IOnboardTx } from "./interfaces";

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
  public buildOnboardKeyTx(key: IKey, contract?: string, namespace?: string): Promise<IOnboardTx> {
    if (contract) {
      this.contract = contract;
    }

    if (namespace) {
      this.namespace = namespace;
    }

    return new Promise((resolve, reject) => {
      const tx: IOnboardTx = {
        $selfsign: true,
        $sigs: {},
        $tx: {
          $contract: this.contract,
          $i: {},
          $namespace: this.namespace,
        },
      };

      tx.$tx.$i[key.name] = {
        publicKey: (key.key.pub as any).pkcs8pem,
        type: key.type,
      };

      this.signTransaction(tx, key)
        .then((txBody: IBaseTransaction) => {
          resolve(txBody as IOnboardTx);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  /**
   * Sign the provided transaction and add it to the body
   *
   * @param {IBaseTransaction} txBody - The transaction to sign
   * @param {IKey} key - The key to use to sign
   * @returns {Promise<IBaseTransaction>} Returns the transaction with its signature
   * @memberof TransactionHandler
   */
  public signTransaction(txBody: IBaseTransaction, key: IKey): Promise<IBaseTransaction> {
    return new Promise((resolve, reject) => {
      try {
        const keyPair = new ActiveCrypto.KeyPair(key.type, (key.key.prv as any).pkcs8pem);

        let identifier = key.name;

        if (key.identity) {
          identifier = key.identity;
        }

        txBody.$sigs[identifier] = keyPair.sign(txBody.$tx);

        return resolve(txBody);
      } catch (err) {
        return reject(err);
      }
    });
  }

  /**
   * Send a transaction to the ledger
   *
   * @param {(IBaseTransaction | IOnboardTx)} tx - The transaction to send
   * @param {Connection} connection - The connection to send the transaction over
   * @returns {Promise<ILedgerResponse>} Returns the ledger response
   * @memberof Transaction
   */
  public sendTransaction(tx: IBaseTransaction | IOnboardTx, connection: Connection): Promise<ILedgerResponse> {
    return new Promise((resolve, reject) => {
      connection
        .sendTransaction(tx)
        .then((response: ILedgerResponse) => {
          resolve(response);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
}
