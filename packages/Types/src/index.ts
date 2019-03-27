import {BigNumber} from "bignumber.js"
import {TransactionReceipt,TxData,ContractAbi} from "ethereum-types";

export type address = string;
export type txid = string;
export type BNType = BigNumber;
export type NumType = string|number|BNType;

export interface defaultTx{
    from?:address,
    gas?: string|number|BNType,
    gasPrice?: string|number|BNType
}

export interface listenEvent {
    filter ?: Filter;
    callback: Function;
}

export interface Filter {
    fromBlock ?: number|BNType,
    toBlock ?: number|BNType,
    provider ?: address,
    subscriber ?:address,
    terminator ?:address,
    endpoint ?:string,
    id ?: number|string|BNType
}

export interface Artifact {
    contract_name: string,
    abi : ContractAbi,
    networks: {
        [networkId: string]:{
            address:string
        }
    }
}



//== Base contract
export interface BaseContractType  {
    artifactsDir ?:string|undefined,
    artifactName: string,
    networkId?: number|undefined,
    networkProvider?: any|undefined,
    contract ?: any,
    coordinator ?:string
}

export interface NetworkProviderOptions{
    artifactsDir ?:string|undefined,
    networkId?: number|undefined,
    networkProvider: any,
    coordinator ?:string
}

export interface TransferType extends defaultTx{
    to:address,
    amount:BigNumber|string|number
}


// CONSTANTS

export const  DEFAULT_GAS = new BigNumber(400000)
export const NULL_ADDRESS= '0x0000000000000000000000000000000000000000';







//######### ARBITER ################
export interface SubscriptionInit extends defaultTx{
    provider:address,
    endpoint :string,
    endpoint_params: Array<string>,
    blocks : NumType,
    pubkey:NumType
}

export interface SubscriptionEnd extends defaultTx{
    provider?:address,
    subscriber ?:address,
    endpoint : string
}

export interface SubscriptionType {
    provider:address,
    subscriber:address,
    endpoint:string
}

export interface SubscriptionParams  extends defaultTx{
    receiver:address,
    endpoint:string,
    params: Array<string>
}

export interface DataPurchaseEvent extends Filter{
    publicKey ?: number|string|BNType,
    amount ?: number|string|BNType,
    endpoint ?: string,
    endpointParams ?: string[]
}

export interface SubscriptionEndEvent extends Filter{
    terminator ?: address
}

export interface ParamsPassedEvent {
    sender ?: address,
    receiver ?: address,
    endpoint ?: string,
    params ?: string
}


//############### BONDAGE ###############


export interface BondType extends defaultTx {
    subscriber ?:address,
    provider:address,
    endpoint:string,
    dots : NumType
}

export interface DelegateBondType extends BondType {
    subscriber :address
}
export interface UnbondType extends defaultTx{
    provider:address,
    endpoint:string,
    dots : NumType
}

export interface SubscribeType extends defaultTx {
    provider:address,
    endpoint:string,
    dots : NumType,
    endpointParams : string[]
}


export interface SubscriberHandler{
    handleResponse : Function,
    handleUnsubscription ?: Function,
    handleSubscription ?: Function
}


export interface ApproveType extends defaultTx{
    provider: address,
    zapNum: string|number|BigNumber
}


export interface BondArgs extends defaultTx{
    provider: address;
    endpoint: string;
    dots: NumType;
}

export interface UnbondArgs extends defaultTx{
	provider: address;
    endpoint: string;
    dots: NumType;
}

export interface DelegateBondArgs extends defaultTx{
    provider: address;
    endpoint: string;
    dots: NumType,
    subscriber: address;
}

export interface BondageArgs {
	subscriber ?: address;
	provider: address;
	endpoint: string;
	dots ?: NumType ;
	zapNum ?: NumType;
}

export interface CalcBondRateType {
    provider: address;
    endpoint: string;
    zapNum: NumType;
}

export interface BondFilter extends Filter{
    numDots ?: NumType,
    numZap ?: NumType
}

//#################### DISPATCH ##################



export interface ResponseArgs extends defaultTx{
  queryId : string,
  responseParams: Array<string | number>,
  dynamic : boolean
}

export interface cancelQuery extends defaultTx{
    queryId : NumType
}

export interface QueryArgs extends defaultTx {
    provider:address,
    endpoint: string,
    query: string,
    endpointParams : Array<string>,
    onchainProvider? : boolean,
    onchainSubscriber? : boolean
}


export interface ResponseArgs extends defaultTx{
    queryId : string,
    responseParams: Array<string | number>,
    dynamic : boolean
}
//=============Dispatch
export interface OffchainResponse{
    id?: number|string,
    subscriber?:address,
    provider?: address ,
    response?: string[]|number[],
    response1?:string,
    response2?:string,
    response3?:string,
    response4?:string
}


//############################### PROVIDER #########################333


export interface InitProvider extends defaultTx  {
    public_key : string,
    title :string
}

export interface InitCurve extends defaultTx{
    endpoint:string,
    term: CurveType,
    broker?: address
}

export type UnsubscribeListen = {
    subscriber:address,
    terminator : address,
    fromBlock : number
}

export type ListenQuery = {
    queryId: string,
    subscriber :address,
    fromBlock : number
}

export interface Respond extends defaultTx{
    queryId:string,
    responseParams : Array<string | number>,
    dynamic:boolean
}



export interface SetProviderParams extends defaultTx{
    key: string,
    value: string
}

export interface SetProviderTitle extends defaultTx{
    title:string
}

export interface ClearEndpoint extends defaultTx{
    endpoint:string
}


//################################## REGISTER #########################


export interface InitProvider extends defaultTx{
  public_key : string,
  title :string
}


export interface InitCurve extends defaultTx{
  endpoint:string,
  term:CurveType,
  broker?: address|undefined
}

export interface EndpointParams extends defaultTx{
  endpoint:string,
  endpoint_params: string[]
}

export interface SetProviderParams extends defaultTx {
  key: string,
  value: string
};

export interface SetProviderTitle extends defaultTx{
    from:address,
    title:string
}

export interface Endpoint extends defaultTx{
    endpoint:string
}


//#################################### SUBSCRIBER #########################33


export interface BondType extends defaultTx {
    subscriber ?:address,
    provider:address,
    endpoint:string,
    dots : NumType
}

export interface DelegateBondType extends BondType {
    subscriber :address
}
export interface UnbondType extends defaultTx{
    provider:address,
    endpoint:string,
    dots : NumType
}

export interface SubscribeType extends defaultTx {
    provider:address,
    endpoint:string,
    dots : NumType,
    endpointParams : string[]
}


export interface SubscriberHandler{
    handleResponse : Function,
    handleUnsubscription ?: Function,
    handleSubscription ?: Function
}



//########################## CURVE ######################

export type CurveType = number[]|string[]

export interface CurveTerm {
  fn: number;
    power: number;
    coef: number;
}

//###################### TOKEN DOT FACTORY #####################
export interface InitProvider extends defaultTx{
  public_key : string,
  title :string
}

export interface InitTokenCurve extends defaultTx{
  specifier:string,
  ticker:string,
  term:CurveType
}

export interface InitCurve extends defaultTx{
  endpoint:string,
  term:CurveType,
  broker?: address|undefined
}


export type NextEndpoint = {
  provider:address,
  endpoint: string
}

export interface EndpointParams extends defaultTx{
  endpoint:string,
  endpoint_params: string[]
}

export interface SetProviderParams extends defaultTx {
  key: string,
  value: string
};
