import { ActiveCrypto } from "@activeledger/activecrypto";
import { Connection } from "./connection";
import { IBaseTransaction, IKey, IOnboardTx } from "./interfaces";

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
   * @param {string} protocol - http or https
   * @param {string} address - The IP address or domain name e.g 0.0.0.0 or www.example.com
   * @param {number} port - The port to use
   * @returns {Promise<any>} Returns the ledger response
   * @memberof Transaction
   */
  public sendTransaction(tx: IBaseTransaction | IOnboardTx, connection: Connection): Promise<any> {
    return new Promise((resolve, reject) => {
      connection
        .sendTransaction(tx)
        .then((response: any) => {
          resolve(response);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
}
