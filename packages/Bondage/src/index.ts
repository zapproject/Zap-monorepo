import {BaseContract} from "@zapjs/basecontract";
import {BondageArgs, BondArgs, UnbondArgs, DelegateBondArgs, BondFilter,
    Filter,txid,NetworkProviderOptions,BNType,NULL_ADDRESS,NumType} from "@zapjs/types"
const {utf8ToHex,isHex,toHex} = require("web3-utils");
const assert = require("assert");
const DEFAULT_GAS = 300000

/**
 * Provides an interface to the Bondage contract for enabling bonds and unbonds to Oracles.
 */
export class ZapBondage extends BaseContract {

    /**
     * Initializes a subclass of BaseContract that can access the methods of the Bondage contract.
     * @constructor
     * @param {NetworkProviderOptions} net. {artifactsDir ?:string|undefined,networkId?: number|undefined,networkProvider: any}
     * @param {string} net.artifactsDir - Directory where contract ABIs are located
     * @param {string} net.networkId -Select which network the contract is located on (mainnet, testnet, private)
     * @param  {Object} net.networkProvider - Ethereum network provider
     * @example new ZaBondage({networkId : 42, networkProvider : web3})
     */
    constructor(obj ?: NetworkProviderOptions){
        super(Object.assign(obj,{artifactName:"BONDAGE"}));
    }

    /**
     * @function
     * Bonds a given number of dots from a subscriber to a provider's endpoint.
     * Note: this requires that at least zapNum has been approved from the subscriber to be transferred by the Bondage contract.
     * @param  {BondArgs} bond. {provider,endpoint,dots,from,gas?=DEFAULT_GAS}
     * @param {string} bond.provider - Provider's address
     * @param {number} bond.dots Number of dots to bond to this provider
     * @param {address} bond.from - Subscriber's owner (0 broker)  or broker's address
     * @param {number} bond.gas - Sets the gas limit for this transaction (optional)
     * @param {Function} cb - Callback for transactionHash event
     * @returns {Promise<txid>} Transaction hash.
     */
    public async bond({provider, endpoint, dots, from, gas= DEFAULT_GAS}: BondArgs, cb?: Function): Promise<txid> {
        assert(dots && dots > 0, "Dots to bond must be greater than 0.");
        const broker = await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call()
        if(broker != NULL_ADDRESS){
            if(from!==broker){
                throw new Error(`Broker address ${broker} needs to call delegate bonding`);
            }
        }

        const promiEvent = this.contract.methods.bond(
            provider,
            utf8ToHex(endpoint),
            toHex(dots))
            .send({from, gas});
        if (cb) {
            promiEvent.on('transactionHash', (transactionHash: string) => cb(null, transactionHash));
            promiEvent.on('error', (error: any) => cb(error));
        }

        return promiEvent;
    }

     /**
     * Bonds a given number of dots from an account to a subscriber. This would be used to bond to a provider on behalf of another account, such as a smart contract.
      * @param {DelegateBondArgs} delegate. {provider, endpoint, dots, subscriber, from, gas= DEFAULT_GAS}
     * @param {string} delegate.provider - Provider's address
     * @param {string} delegate.endpoint - Data endpoint of the provider
     * @param {number} delegate.dots - Number of dots to bond to this provider
     * @param {address} delegate.subscriber - Address of the intended holder of the dots (subscriber)
     * @param {address} delegate.from - Address of the data subscriber
     * @param {number} [delegate.gas] - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Transaction hash
     */
    public async delegateBond({provider, endpoint, dots, subscriber, from, gas= DEFAULT_GAS}: DelegateBondArgs): Promise<txid> {
        assert(dots && dots > 0, "Dots to bond must be greater than 0.");
        dots = toHex(dots)
         const broker = await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call()
         if(broker != NULL_ADDRESS){
             if(from!==broker){
                 throw new Error(`Broker address ${broker} needs to call delegate bonding for this endpoint`);
             }
         }
        return await this.contract.methods.delegateBond(
            subscriber,
            provider,
            utf8ToHex(endpoint),
            dots)
            .send({from, gas});
    }


    /**
     * Unbonds a given number of dots from a provider's endpoint and transfers the appropriate amount of Zap to the subscriber.
     * @param {UnbondArgs} unbond. {provider, endpoint, dots, from, gas= DEFAULT_GAS}
     * @param {address} unbond.provider - Address of the data provider
     * @param {string} unbond.endpoint - Data endpoint of the provider
     * @param {number} unbond.dots - The number of dots to unbond from the contract
     * @param {address} unbond.from  - Address of the data subscriber
     * @param {number} unbond.gas - Sets the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Transaction hash
     */
    public async unbond({provider, endpoint, dots, from, gas= DEFAULT_GAS}: UnbondArgs): Promise<txid> {
        assert(dots && dots>0,"Dots to unbond must be greater than 0");
        dots = toHex(dots)
        const broker = await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call()
        if(broker != NULL_ADDRESS){
            if(from!==broker){
                throw `Broker address ${broker} needs to call unbonding for this endpoint`;
            }
        }
        return await this.contract.methods.unbond(
            provider,
            utf8ToHex(endpoint),
            dots)
            .send({from, gas});
    }


    /************************* GETTERS ****************************/

    /**
     * Gets the number of dots that are bounded to a provider's endpoint for the current subscriber.
     * @param {BondageArgs} bond. {subscriber, provider, endpoint}
     * @param {address} bond.subscriber - Address of the data subscriber
     * @param {address} bond.provider  - Address of the data provider
     * @param {string} bond.endpoint - Data endpoint of the provider
     * @returns {Promise<string|BigNumber>} Number of bound dots to this provider's endpoint
     */
    public async getBoundDots({subscriber, provider, endpoint}: BondageArgs): Promise<NumType> {
        return await this.contract.methods.getBoundDots(
            subscriber,
            provider,
            utf8ToHex(endpoint)
        ).call();
    }

    /**
     * Calculates the amount of Zap required to bond a given number of dots to a provider's endpoint.
     * @param {BondageArgs} bondage. {provider, endpoint, dots}
     * @param {address} bondage.provider - Address of the data provider
     * @param {string} bondage.endpoint - Endpoint to calculate zap
     * @param {number} bondage.dots - Number of dots to calculate the price (in Zap) for
     * @returns {Promise<string|BigNumber>} Price (in Zap) for the given number of dots
     */
    public async calcZapForDots({provider, endpoint, dots}: BondageArgs): Promise<string|BNType> {
      console.log("to hex dots",dots,toHex(dots))
        return await this.contract.methods.calcZapForDots(
            provider,
            utf8ToHex(endpoint),
            toHex(dots)).call();
    }

    /**
     * Calculates the amount of Zap required to bond a given number of dots to a provider's endpoint.
     * @param {BondageArgs} bondage. {provider, endpoint, dots}
     * @param {address} bondage.provider - Address of the data provider
     * @param {string} bondage.endpoint -Data endpoint of the provider
     * @param {number} bondage.dots - dots that subscriber want to use
     * @returns {Promise<string|BigNumber>} Price (in Zap wei) for next x dots to bond
     */
    public async currentCostOfDot({provider, endpoint, dots}: BondageArgs): Promise<string|BNType> {
        dots = toHex(dots)
        return this.contract.methods.currentCostOfDot(
            provider,
            utf8ToHex(endpoint),
            dots
        ).call();
    }

    /**
     * Get Maximum dots that can be bound for an endpoint of a provider
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {string} b.provider - Provider's address
     * @param {string} b.endpoint - Provider's endpoint to get dots limit
     * @returns {Promise<string|BigNumber>} Number of maximum dots that can be bound
     */
    public  async getDotsLimit({provider,endpoint}:BondageArgs):Promise<string|BNType>{
        return await this.contract.methods.dotLimit(provider,utf8ToHex(endpoint)).call().valueOf()
    }

    /**
     * Gets the total number of dots that have been issued by a provider's endpoint.
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {address} b.provider - Address of the data provider
     * @param {string} b.endpoint - Data endpoint of the provider
     * @returns {Promise<string|BigNumber>} Number of dots issued
     */
    public async getDotsIssued({provider, endpoint}: BondageArgs): Promise<string> {
        return await this.contract.methods.getDotsIssued(
            provider,
            utf8ToHex(endpoint)
        ).call();
    }


    /**
     * Get Broker address for this provider's endpoint, return NULL_ADDRESS if there is none
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {string} b.provider - Provider's Address
     * @param {string} b.endpoint - Provider's endpoint to get Broker's address
     * @returns {Promise<string>} Broker's address for this endpoint, null address if none
     */
    public async getBrokerAddress({provider,endpoint}:BondageArgs):Promise<string>{
        return  await this.contract.methods.getEndpointBroker(provider,utf8ToHex(endpoint)).call();
    }
    /**
     * Gets the total amount of Zap that has been bonded to a provider's endpoint.
     * @param {BondageArgs} b. {provider,endpoint}
     * @param {address} b.provider - Address of the data provider
     * @param {string} b.endpoint  - Data endpoint of the provider
     * @returns {Promise<number>} Amount of Zaps (wei) that are bound to this endpoint
     */
    public async getZapBound({provider, endpoint}: BondageArgs ): Promise<string|BNType> {
        return await this.contract.methods.getZapBound(provider,utf8ToHex(endpoint)).call();
    }


    /**
     * Get Number of dots escrow
     * @param provider
     * @param endpoint
     * @param subscriber
     * @returns Number of escrow dots
     */
    async getNumEscrow({provider,endpoint,subscriber}:BondageArgs) :Promise<number|string>{
        return await this.contract.methods.getNumEscrow(subscriber,provider,endpoint).call();
    }

    /********************** EVENTS ***************************/
    /**
     * Listen for all Bondage contract events
     * @param {Filter} filters :{provider:address,subsriber:address,endpoint:bytes32,dots:number|string, numZap:number|string}
     * @param {Function} callback
     */
    public listen(filters: BondFilter = {}, callback: Function): void {
        this.contract.events.allEvents(filters, {fromBlock: 0, toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Bound" Bondage contract events
     * @param {Filter} filters :{provider:address,subsriber:address,endpoint:bytes32,dots:number|string, numZap:number|string}
     * @param {Function} callback
     */
    public listenBound(filters: BondFilter = {}, callback: Function): void {
        this.contract.events.Bound(filters, {toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Unbond" Bondage contract events
     * @param {Filter} filters :{provider:address,subsriber:address,endpoint:bytes32,dots:number|string}
     * @param {Function} callback
     */
    public listenUnbound(filters: BondFilter = {} , callback: Function): void {
        this.contract.events.Unbond(filters, {toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Escrow" Bondage contract events
     * @param {Filter} filters :{provider:address,subsriber:address,endpoint:bytes32,dots:number|string}
     * @param {Function} callback
     */
    public listenEscrowed(filters: BondFilter = {}, callback: Function): void {
        this.contract.events.Escrowed(filters, {toBlock: "latest"}, callback);
    }

    /**
     * Listen for "Released" Bondage contract events
     * @param {Filter} filters :{provider:address,subsriber:address,endpoint:bytes32,dots:number|string}
     * @param {Function} callback
     */
    public listenReleased(filters: BondFilter = {}, callback: Function): void {
        this.contract.events.Released(filters, {toBlock: "latest"}, callback);
    }

    /**
     * Listen to "Returned" events when dots are returned from provider to subscriber
     * @param filters
     * @param callback
     */
    public listenReturned(filters: BondFilter={}, callback:Function):void{
        this.contract.events.Returned(filters,{toBlock:'latest'},callback);
    }

}
