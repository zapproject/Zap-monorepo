const Web3 = require('web3');
import {Utils} from "@zapjs/utils";
import {NULL_ADDRESS} from "@zapjs/types"

/**
 * Bootstrap for Dispatch tests, with accounts[0] = provider, accounts[2]=subscriber
 * @param {} zapProvider
 * @param {Array<string>} accounts
 * @param deployedRegistry
 * @param deployedBondage
 * @param deployedToken
 * @returns {Promise<void>}
 */
export async function bootstrap(zapProvider:any,accounts:Array<string>,deployedRegistry:any, deployedToken:any,deployedBondage:any){
    let normalizedP = Utils.normalizeProvider(zapProvider);
    let defaultTx = {from:accounts[0],gas:Utils.Constants.DEFAULT_GAS};
    await deployedRegistry.contract.methods.initiateProvider(normalizedP.pubkey,normalizedP.title).send(defaultTx);
    let tokenOwner = await deployedToken.contract.methods.owner().call();
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint,zapProvider.curve.values, NULL_ADDRESS).send(defaultTx);
    let providerCurve = await deployedRegistry.contract.methods.getProviderCurve(accounts[0],normalizedP.endpoint).call();
    let endpointBroker = await deployedRegistry.contract.methods.getEndpointBroker(accounts[0],normalizedP.endpoint).call();
 
    console.log("provider curve", providerCurve);
    console.log("token owner : ", tokenOwner)
    console.log("endpoint broker: ", endpointBroker);

    
    
    for(let account of accounts) {
        await deployedToken.contract.methods.allocate(account,1000).send({from: tokenOwner,gas:Utils.Constants.DEFAULT_GAS});
    }
    console.log("Token allocated")
    let requiredZap = await deployedBondage.contract.methods.calcZapForDots(accounts[0],normalizedP.endpoint,10).call();
    console.log("required zap : ", requiredZap);
    console.log("bondage contract address", deployedBondage.contract._address)
    await deployedToken.contract.methods.approve(deployedBondage.contract._address, requiredZap).send({from:accounts[2],gas:Utils.Constants.DEFAULT_GAS});
    console.log("Token approved, endpoint : ", normalizedP.endpoint);
    await deployedBondage.contract.methods.bond(accounts[0],normalizedP.endpoint, 10).send({from:accounts[2], gas:Utils.Constants.DEFAULT_GAS});
    return "done";
}
