import { ActiveCrypto } from "@activeledger/activecrypto";
import * as http from "http";
import * as https from "https";
import { IBaseTransaction, IHttpOptions, ILedgerResponse, INodeKeyData } from "./interfaces";

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

  /**
   * Creates an instance of Connection.
   * @param {string} protocol - The protocol to use, usually http or https
   * @param {string} address - The URL or IP of the node
   * @param {number} portNumber - The port number of the node
   * @param {boolean} [encrypt] - Optional: Set to true to encrypt the transaction before sending
   * @memberof Connection
   */
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
   * @returns {Promise<ILedgerResponse>} Returns the ledger response
   * @memberof Connection
   */
  public sendTransaction(txBody: IBaseTransaction): Promise<ILedgerResponse> {
    return new Promise((resolve, reject) => {
      if (this.encryptTx) {
        // Handle encrypted transactions
        this.httpOptions.headers = this.encryptedHeaders;
        this.encrypt(txBody)
          .then((encryptedTx: string) => {
            this.postTransaction(encryptedTx)
              .then((resp: ILedgerResponse) => {
                resolve(resp);
              })
              .catch((err: any) => {
                reject(err);
              });
          })
          .catch((err: any) => {
            reject(err);
          });
      } else {
        // Handle normal transactions
        this.postTransaction(txBody)
          .then((resp: ILedgerResponse) => {
            resolve(resp);
          })
          .catch((err: any) => {
            reject(err);
          });
      }
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

        let body: string = "";

        res.setEncoding("utf8");
        res.on("data", (chunk: any) => {
          body += chunk;
        });

        res.on("end", () => {
          return resolve(JSON.parse(body));
        });
      });

      req.on("error", (err: any) => {
        return reject(err);
      });

      if (typeof tx !== "string") {
        tx = JSON.stringify(tx);
      }

      req.write(tx);
      req.end();
    });
  }

  /**
   * Encrypts the transaction if requested
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
          try {
            const keyPair = new ActiveCrypto.KeyPair("rsa", keyData.pem);
            resolve(keyPair.encrypt(txBody));
          } catch (e) {
            reject(e);
          }
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
   * @returns {Promise<INodeKeyData>} Returns the nodes key data
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
              pem: Buffer.from(jsonData.pem, "base64").toString(),
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
