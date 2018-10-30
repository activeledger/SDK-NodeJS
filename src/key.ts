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
