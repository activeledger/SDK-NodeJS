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
import { KeyType } from "./enums";
import { IKey, ILedgerResponse, IOnboardTx } from "./interfaces";
import { TransactionHandler } from "./transaction";

export class KeyHandler {
  /**
   * Generate a new key
   *
   * @param {string} keyName - The name of the key
   * @param {KeyType} keyType - The type of Key to generate
   * @returns {Promise<IKey>} Returns the Key Object
   * @memberof KeyHandler
   */
  public generateKey(keyName: string, keyType: KeyType): Promise<IKey> {
    let internalType: string;

    return new Promise((resolve, reject) => {
      switch (keyType) {
        case KeyType.EllipticCurve:
          internalType = "secp256k1";
          break;

        case KeyType.RSA:
        default:
          internalType = "rsa";
          break;
      }

      try {
        const keyHolder: IKey = {
          key: new ActiveCrypto.KeyPair(internalType).generate(),
          name: keyName,
          type: internalType,
        };

        return resolve(keyHolder);
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * Onboard a key to the ledger and assign an identity to the key
   *
   * @param {IKey} key - The key to onboard
   * @param {Connection} connection - The connection to send the transaction over
   * @returns {Promise<ILedgerResponse>} Returns Ledger response as a promise
   * @memberof KeyHandler
   */
  public onboardKey(key: IKey, connection: Connection): Promise<ILedgerResponse> {
    return new Promise((resolve, reject) => {
      const tx = new TransactionHandler();
      tx.buildOnboardKeyTx(key).then((txBody: IOnboardTx) => {
        tx.sendTransaction(txBody, connection)
          .then((response: ILedgerResponse) => {
            key.identity = response.$streams.new[0].id;
            resolve(response);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    });
  }
}
