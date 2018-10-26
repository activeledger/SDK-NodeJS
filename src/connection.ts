import { ActiveCrypto } from "@activeledger/activecrypto";
import * as http from "http";
import * as https from "https";
import { IBaseTransaction, IHttpOptions, ILedgerResponse, INodeKeyData } from './interfaces';

export class Connection {
  private protocol: string;
  private address: string;
  private port: number;
  private protocolService: any;

  private encryptTx = false;

  private httpOptions: IHttpOptions;

  private encryptedHeaders = {
    "Content-Type": "application/json",
    "X-Activeledger-Encrypt": "1",
  };

  constructor(protocol: string, address: string, portNumber: number, encrypt?: boolean) {
    this.httpOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      hostname: address,
      method: "POST",
      path: "/",
      port: portNumber,
    };

    this.protocol = protocol;
    this.address = address;
    this.port = portNumber;

    if (protocol === "https") {
      this.protocolService = https;
    } else {
      this.protocolService = http;
    }

    if (encrypt) {
      this.encryptTx = encrypt;
    }
  }

  /**
   * Send a transaction to the specified ledger
   *
   * @param {IBaseTransaction} txBody - The Body of the transaction
   * @param {boolean} [encrypt] - Whether or not the transaction should be encrypted
   * @returns {Promise<ILedgerResponse>} Returns the response as a promise
   * @memberof Connection
   */
  public sendTransaction(txBody: IBaseTransaction): Promise<ILedgerResponse> {
    return new Promise((resolve, reject) => {
      if (this.encryptTx) {
        this.httpOptions.headers = this.encryptedHeaders;
        this.encrypt(txBody)
          .then((encryptedTx: string) => {
            this.postTransaction(encryptedTx)
            .then((resp: any) => {
              resolve(resp as ILedgerResponse);
            })
            .catch((err: any) => {
              reject(err);
            })
          })
          .catch((err: any) => {
            reject(err);
          });
      }

      return this.postTransaction(txBody);
    });
  }

  /**
   * POST the provided transaction to the ledger
   *
   * @private
   * @param {(string | IBaseTransaction)} tx - The transaction to POST
   * @returns {Promise<ILedgerResponse>} Returns the ledger response
   * @memberof Connection
   */
  private postTransaction(tx: string | IBaseTransaction): Promise<ILedgerResponse> {
    return new Promise((resolve, reject) => {
      const req = this.protocolService.request(this.httpOptions, (res: any) => {
        if (res.statusCode !== 200) {
          reject(res);
        }

        res.setEncoding("utf8");
        res.on("data", (body: any) => {
          // tslint:disable-next-line:no-console
          console.log(body);
          resolve(JSON.parse(body));
        });
      });

      req.on("error", (err: any) => {
        reject(err);
      });

      if (typeof tx !== "string") {
        tx = JSON.stringify(tx);
      }

      req.write(tx);
      req.end();
    });
  }

  /**
   * Encrypts the transaction if required
   *
   * @private
   * @param {IBaseTransaction} txBody - The transaction to encrypt
   * @returns {Promise<string>} Returns the encrypted data as a string
   * @memberof Connection
   */
  private encrypt(txBody: IBaseTransaction): Promise<string> {
    return new Promise((resolve, reject) => {
      this.getNodeKeyData()
        .then((keyData: INodeKeyData) => {
          const keyPair = new ActiveCrypto.KeyPair(keyData.encryption, keyData.pem);

          resolve(keyPair.encrypt(txBody));
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  /**
   * Get the key data from the node specified in the connection
   *
   * @private
   * @returns {Promise<INodeKeyData>} Returns the key data as a promise
   * @memberof Connection
   */
  private getNodeKeyData(): Promise<INodeKeyData> {
    return new Promise((resolve, reject) => {
      const url = `${this.protocol}://${this.address}:${this.port}/a/status`;

      this.protocolService
        .get(url, (resp: any) => {
          let data = "";

          resp.on("data", (chunk: any) => {
            data += chunk;
          });

          resp.on("end", () => {
            const jsonData = JSON.parse(data);

            const nodeKey: INodeKeyData = {
              encryption: "rsa",
              pem: atob(jsonData.pem),
            };

            resolve(nodeKey);
          });
        })
        .on("error", (err: any) => {
          reject(err);
        });
    });
  }
}


