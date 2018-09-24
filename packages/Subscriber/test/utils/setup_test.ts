const Web3 = require('web3');
const {utf8ToHex,toBN} = require("web3-utils");
import {Utils} from "@zapjs/utils";

/**
 * Bootstrap for Dispatch tests, with accounts[0] = provider, accounts[2]=subscriber
 * @param {} zapProvider
 * @param {Array<string>} accounts
 * @param deployedRegistry
 * @param deployedBondage
 * @param deployedToken
 * @returns {Promise<void>}
 */
export async function bootstrap(zapProvider:any,accounts:Array<string>,zapRegistry:any, zapToken:any){
    let normalizedP = Utils.normalizeProvider(zapProvider);
    let defaultTx = {from:accounts[0], gas:Utils.Constants.DEFAULT_GAS};
    await zapRegistry.contract.methods.initiateProvider(normalizedP.pubkey,normalizedP.title).send(defaultTx);
    let tokenOwner = await zapToken.contract.methods.owner().call();
    console.log("P : ", zapProvider)
    await zapRegistry.initiateProviderCurve({endpoint:zapProvider.endpoint,term:zapProvider.curve.values, broker: zapProvider.broker,from:accounts[0]});
    let providerCurve = await zapRegistry.getProviderCurve(accounts[0],zapProvider.endpoint);
    let endpointBroker = await zapRegistry.getEndpointBroker(accounts[0],normalizedP.endpoint);
    console.log("provider curve", providerCurve);
    console.log("endpoint broker: ", endpointBroker);
    for(let account of accounts) {
        await zapToken.contract.methods.allocate(account, Utils.toZapBase(1000)).send({from: tokenOwner,gas:Utils.Constants.DEFAULT_GAS});
    }
    return "done";
}
