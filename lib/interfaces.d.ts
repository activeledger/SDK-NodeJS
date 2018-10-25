import { ActiveCrypto } from '@activeledger/activecrypto';
export interface IKey {
    name: string;
    key: ActiveCrypto.KeyHandler;
    type: string;
}
export interface IOnboardTx extends IBaseTransaction {
    $selfsign: boolean;
    $sigs: any;
    $tx: IOnboardTxBody;
}
export interface IOnboardTxBody {
    $contract: string;
    $namespace: string;
    $i: any;
}
export interface INodeKeyData {
    encryption: string;
    pem: string;
}
export interface IHttpOptions {
    headers?: any;
    hostname: string;
    method: string;
    path: string;
    port: number;
}
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
    $new: INewObject[];
    $update: IUpdatedObject[];
}
interface INewObject {
    id: string;
    name: string;
}
interface IUpdatedObject {
    id: string;
    name: string;
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
export {};
