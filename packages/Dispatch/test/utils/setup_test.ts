import {Utils } from '@zapjs/utils';
import {NULL_ADDRESS } from '@zapjs/types';
import {toHex } from 'web3-utils';
/**
 * Bootstrap for Dispatch tests, with accounts[0] = provider, accounts[2]=subscriber
 * @param {} zapProvider
 * @param {Array<string>} accounts
 * @param deployedRegistry
 * @param deployedBondage
 * @param deployedToken
 * @returns {Promise<void>}
 */
export async function bootstrap(zapProvider:any, accounts:Array<string>, deployedRegistry:any, deployedToken:any, deployedBondage:any){
    const dots = 10;
    const normalizedP = Utils.normalizeProvider(zapProvider);
    const defaultTx = {from: accounts[0], gas: Utils.Constants.DEFAULT_GAS };
    await deployedRegistry.contract.methods.initiateProvider(zapProvider.pubkey, normalizedP.title).send(defaultTx);
    const tokenOwner = await deployedToken.contract.methods.owner().call();
    await deployedRegistry.contract.methods.initiateProviderCurve(normalizedP.endpoint, zapProvider.curve.values.map((i:string)=>toHex(i)), NULL_ADDRESS).send(defaultTx);
    const providerCurve = await deployedRegistry.contract.methods.getProviderCurve(accounts[0], normalizedP.endpoint).call();
    const endpointBroker = await deployedRegistry.contract.methods.getEndpointBroker(accounts[0], normalizedP.endpoint).call();
    console.log('provider curve', providerCurve);
    console.log('token owner : ', tokenOwner);
    console.log('endpoint: ', normalizedP.endpoint);
    console.log('endpoint broker: ', endpointBroker);
    for (const account of accounts) {
        await deployedToken.contract.methods.allocate(account, 1000).send({from: tokenOwner, gas: Utils.Constants.DEFAULT_GAS });
    }
    const requiredZap = await deployedBondage.contract.methods.calcZapForDots(accounts[0], normalizedP.endpoint, dots).call();
    await deployedToken.contract.methods.approve(deployedBondage.contract._address, requiredZap).send({from: accounts[2], gas: Utils.Constants.DEFAULT_GAS });
    await deployedBondage.contract.methods.bond(accounts[0], normalizedP.endpoint, dots).send({from: accounts[2], gas: Utils.Constants.DEFAULT_GAS });
    return 'done';
}
