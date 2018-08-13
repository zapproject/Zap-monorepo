import  {BaseContract} from '@zapjs/basecontract';
import {SubscriptionInit,SubscriptionEnd,SubscriptionType} from "./types"
import {Filter,txid,DEFAULT_GAS,NetworkProviderOptions} from "@zapjs/types"
const {toBN,utf8ToHex,isHex} = require ('web3-utils');
/**
 * @class
 * Provides an interface to the Arbiter contract for managing temporal subscriptions to oracles.
 */
export class ZapArbiter extends BaseContract {

    /**
     * Initializes a subclass of BaseContract that can access the methods of the Arbiter contract.
     * @constructor
     * @augments BaseContract
     * @param {string} artifactsDir Directory where contract ABIs are located
     * @param {string} networkId Select which network the contract is located on (mainnet, testnet, private)
     * @param  networkProvider Ethereum network provider (e.g. Infura)
     */
    constructor(obj ?: NetworkProviderOptions){
        super(Object.assign(obj,{artifactName:"Arbiter"}))
    }

    /**
     * Initializes a subscription with a given provider, endpoint, and endpoint parameters.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {Array<string>} endpoint_params Params passed to endpoint
     * @param {number} blocks Number of blocks that the subscription will last for
     * @param {number} provider Public key of provider
     * @param {address} from Subscriber's address
     * @param {number} gas Set the gas limit for this transaction (optional)
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async initiateSubscription(
        {provider, endpoint, endpoint_params, blocks, pubkey, from, gas=DEFAULT_GAS} : SubscriptionInit):Promise<txid> {
        try {
            endpoint_params = endpoint_params.map((i:string)=>{
                if(!isHex(i)) {
                    return utf8ToHex(i)
                }
                else return i;
            })
            return await this.contract.methods.initiateSubscription(
                provider,
                utf8ToHex(endpoint),
                endpoint_params,
                toBN(pubkey),
                toBN(blocks)).send({from, gas});
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the subscription status for a given provider, subscriber, and endpoint.
     * @func getSubscription 
     * @param {address} provider Address of the data provider
     * @param {address} subscriber Address of the subscriber
     * @param {string} endpoint Data endpoint of the provider
     * @returns {Promise<string>} Returns a Promise that will eventually resolve into information on the currently active subscription
     */
    async getSubscription({provider,subscriber,endpoint}:SubscriptionType){
        let subscription = await this.contract.methods.getSubscription(provider,subscriber,utf8ToHex(endpoint)).call();
        //console.log("Subscription result : ",subscription)
        return subscription
    }

    /**
     * Ends a currently active subscription for a given subscriber and endpoint from the subscriber.
     * @param {address} provider Address of the data provider
     * @param {string} endpoint Data endpoint of the provider
     * @param {address} from Address of the subscriber
     * @param {number} gas Gas limit of this transaction
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async endSubscriptionSubscriber({provider, endpoint, from, gas=DEFAULT_GAS}:SubscriptionEnd) :Promise<txid>{
        let unSubscription:any
        unSubscription =  await this.contract.methods.endSubscriptionSubscriber(
            provider,
            utf8ToHex(endpoint))
            .send({from, gas});
        return unSubscription
    }

    /**
     * Ends a currently active subscription for a given subscriber and endpoint from the provider.
     * @param {address} subscriber Address of the subscriber
     * @param {string} endpoint Data endpoint of the provider
     * @param {address} from Address of the provider
     * @param {number} gas Gas limit of this transaction
     * @returns {Promise<txid>} Returns a Promise that will eventually resolve into a transaction hash
     */
    async endSubscriptionProvider({subscriber, endpoint, from, gas=DEFAULT_GAS}:SubscriptionEnd) :Promise<txid>{
        let unSubscription:any;
        unSubscription= await this.contract.methods.endSubscriptionProvider(
            subscriber,
            utf8ToHex(endpoint))
            .send({from, gas});
        return unSubscription;
}

    /**
     * Listen for "DataSubscriptionEnd" unsubscription events with an optional Filter, executing a callback function when it matches the filter.
     * @param {Filter} filters Filters events based on certain key parameters (optional)
     * @param {Function} callback Callback function that is called when subscription is ended
     */
    listenSubscriptionEnd(filters:Filter={}, callback:Function){
        try {
            // Specify filters and watch Incoming event
            let filter = this.contract.events
                .DataSubscriptionEnd(
                    filters,
                    { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' },
                    callback);

            return filter;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Listen for "DataPurchase" subscription events with an optional Filter, executing a callback function when it matches the filter.
     * @param {Filter} filters Filters events based on certain key parameters (optional)
     * @param {Function} callback Callback function that is called when subscription is started
     */
    listenSubscriptionStart(filters:Filter ={}, callback:Function){
        try {
            // Specify filters and watch Incoming event
            let filter = this.contract.events.DataPurchase(
                filters,
                { fromBlock: filters.fromBlock ? filters.fromBlock : 0, toBlock: 'latest' }, 
                callback);

            return filter;
        } catch (err) {
            throw err;
        }
    }


    /**
     * Listen for all Arbiter contract events based on a given filter.
     * @param {Filter} filter Filters events based on certain key parameters
     * @param {Function} callback Callback function that is called whenever an event is emitted
     */
    listen(callback:Function){
        return this.contract.events.allEvents({fromBlock: 0, toBlock: 'latest'}, callback);
    }

}
