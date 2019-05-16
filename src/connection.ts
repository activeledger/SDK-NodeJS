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
import Axios, { AxiosResponse } from "axios";
import { IBaseTransaction, IConnectionDataOptions, IHttpOptions, ILedgerResponse, INodeKeyData } from "./interfaces";

/**
 * Handles connecting to the ledger, sending encrypted and non-encrypted transactions
 *
 * @export
 * @class Connection
 */
export class Connection {
  /**
   * Holds options provided in the constructor
   *
   * @private
   * @type {IConnectionDataOptions}
   * @memberof Connection
   */
  private options: IConnectionDataOptions;

  /**
   * Holds HTTP connection options
   *
   * @private
   * @type {IHttpOptions}
   * @memberof Connection
   */
  private httpOptions: IHttpOptions;

  /**
   * Creates an instance of Connection.
   * @param {IConnectionDataOptions} options
   * @memberof Connection
   */
  constructor(options: IConnectionDataOptions);
  /**
   * Creates an instance of Connection.
   * @param {string} protocol - The protocol to use, usually http or https
   * @param {string} address - The URL or IP of the node
   * @param {number} portNumber - The port number of the node
   * @param {boolean} [encrypt] - Optional: Set to true to encrypt the transaction before sending
   * @memberof Connection
   */
  constructor(protocol: string, address: string, portNumber: number | string, encrypt?: boolean);
  constructor(
    optionsOrProtocol: string | IConnectionDataOptions,
    address?: string,
    portNumber?: number | string,
    encrypt?: boolean,
  ) {
    const generateOptions = (): IConnectionDataOptions => {
      return {
        address: address as string,
        encrypt: encrypt ? true : false,
        portNumber: portNumber as number | string,
        protocol: optionsOrProtocol as string,
      };
    };

    this.options = typeof optionsOrProtocol === "string" ? generateOptions() : optionsOrProtocol;

    this.httpOptions = {
      baseURL: this.options.protocol + "://" + this.options.address + ":" + this.options.portNumber,
      headers: this.options.encrypt
        ? // Use encryption headers
          {
            "Content-Type": "application/json",
            "X-Activeledger-Encrypt": "1",
          }
        : // Use normal headers
          { "Content-Type": "application/json" },
      method: "POST",
      port: this.options.portNumber,
    };
  }

  /**
   * Send a transaction to the specified ledger
   *
   * @param {IBaseTransaction} txBody - The Body of the transaction
   * @returns {Promise<ILedgerResponse>} Returns the ledger response
   * @memberof Connection
   */
  public sendTransaction(txBody: IBaseTransaction): Promise<ILedgerResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        // Should the data be encrypted first?
        const transactionData = this.options.encrypt ? await this.encrypt(txBody) : txBody;

        // Post the transaction data
        this.postTransaction(transactionData)
          .then((resp: ILedgerResponse) => {
            resolve(resp);
          })
          .catch((err: any) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
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
      this.httpOptions.data = tx;

      Axios(this.httpOptions)
        .then((resp: AxiosResponse) => {
          resolve(resp.data as ILedgerResponse);
        })
        .catch((error: Error) => {
          reject(error);
        });
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
          } catch (error) {
            reject(error);
          }
        })
        .catch((error: Error) => {
          reject(error);
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
      const url = `${this.options.protocol}://${this.options.address}:${this.options.portNumber}/a/status`;

      Axios.get(url)
        .then((resp: AxiosResponse) => {
          const jsonData = resp.data;

          const nodeKey: INodeKeyData = {
            encryption: "rsa",
            pem: Buffer.from(jsonData.pem, "base64").toString(),
          };

          resolve(nodeKey);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }
}
