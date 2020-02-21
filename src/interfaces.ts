// Reference Fix (Node SDK Builds)
/// <reference lib="dom" />

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
import EventSourceN = require("eventsource");

// #region Key Interfaces

export interface IKey {
  identity?: string;
  key: ActiveCrypto.KeyHandler;
  type: string;
  name: string;
}

export interface IKeyExportOptions {
  location: string;
  createDir?: boolean;
  overwrite?: boolean;
  name?: string;
}
// #endregion

// #region Transaction Interfaces

interface ILabelledTransactionInputData {
  $stream: string;
}

interface ILabelledTransactionInput {
  [inputLabel: string]: ILabelledTransactionInputData;
}

interface ILabelledTransactionBody extends ITxBody {
  $i: ILabelledTransactionInput;
}

export interface ILabelledTransaction extends IBaseTransaction {
  $tx: ILabelledTransactionBody;
}
export interface ILabelledTransactionOptions {
  key: IKey;
  namespace: string;
  contract: string;
  inputLabel: string;
  inputData: {};
  entry?: string;
  outputs?: {};
  readonly?: {};
  selfsign?: boolean;
  stream: string;
}

export interface IOnboardTx extends IBaseTransaction {
  $selfsign: boolean;
  $sigs: any;
  $tx: IOnboardTxBody;
}

export interface IOnboardTxBody {
  $contract: string;
  $i: any;
  $namespace: string;
}

export interface IBaseTransaction {
  $selfsign?: boolean;
  $sigs: any;
  $tx: ITxBody;
}

interface ITxBody {
  $entry?: string;
  $contract: string;
  $namespace: string;
  $i: any;
  $o?: any;
  $r?: any;
}

export interface IOnboardKeyTxOptions {
  contract?: string;
  namespace?: string;
}
// #endregion

// #region Connection Interfaces

export interface INodeKeyData {
  encryption: string;
  pem: string;
}

export interface IHttpOptions {
  baseURL: string;
  data?: any;
  headers?: any;
  method: string;
  path?: string;
  port: number | string;
}

export interface IConnectionDataOptions {
  protocol: string;
  address: string;
  portNumber: number | string;
  encrypt?: boolean;
}
// #endregion

// #region Ledger response interfaces

export interface ILedgerResponse {
  $umid: string;
  $summary: ISummaryObject;
  $streams: IStreamsObject;
}

interface ISummaryObject {
  total: number;
  vote: number;
  commit: number;
}

interface IStreamsObject {
  new: INewObject[];
  updated: IUpdatedObject[];
}

interface INewObject {
  id: string;
  name: string;
}

interface IUpdatedObject {
  id: string;
  name: string;
}
// #endregion

// #region Event interfaces
export interface IEventConfig {
  contract: string;
  event?: string;
}

export interface IEventListeners {
  [id: number]: EventSource | EventSourceN;
}
// #endregion
