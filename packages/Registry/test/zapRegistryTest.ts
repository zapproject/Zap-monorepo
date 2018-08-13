import {join} from "path";
const Web3 = require('web3');
const {hexToUtf8,BN,utf8ToHex} = require("web3-utils");
const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;

import {Utils} from "@zapjs/utils";
import {BaseContract} from "@zapjs/basecontract"
import {ZapRegistry} from '../src';

async function configureEnvironment(func:Function) {
    await func();
}

describe('Registry test', () => {
    let accounts :Array<string>= [],
    ganacheServer:any,
    registryWrapper:any,
    web3,
    testArtifacts,
    testZapProvider = Utils.Constants.testZapProvider,
    buildDir:string = join(__dirname,"contracts"),
    options = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider
    };

    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(join(__dirname,"contracts"));
            testArtifacts = Utils.getArtifacts(join(__dirname,"contracts"));
            done();
        });
    });

    after(function(){
        console.log("Done running Registry tests");
        ganacheServer.close();
        process.exit();
    });

    it("should be able to create registryWrapper", async ()=>{
        registryWrapper = new ZapRegistry(options)
    })


    it('Should initiate provider in zap registry contract', async () => {
     let tx =  await registryWrapper.initiateProvider({
        public_key: testZapProvider.pubkey,
        title: testZapProvider.title,
        endpoint: testZapProvider.endpoint,
        endpoint_params: testZapProvider.endpoint_params,
        from: accounts[0],
        gas: 600000
    });
     expect(tx).to.include.keys("events")
     expect(tx.events).to.include.keys("NewProvider")
     expect(tx.events.NewProvider).to.include.keys("returnValues");
     let returnValues = tx.events.NewProvider.returnValues;
     expect(returnValues).to.include.keys("provider","title","endpoint")
     expect(testZapProvider.title).to.equal(hexToUtf8(returnValues.title))
     expect(returnValues.provider).to.equal(accounts[0]);
     expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
     const title = await registryWrapper.getProviderTitle(accounts[0]);
     await expect(title).to.be.equal(testZapProvider.title);
     const pubkey = await registryWrapper.getProviderPublicKey(accounts[0]);
     await expect(pubkey).to.be.equal(testZapProvider.pubkey);
     const param1 = await registryWrapper.getNextEndpointParams({
        provider:accounts[0],
        endpoint:testZapProvider.endpoint,
        index:0})
     await expect(param1).to.be.equal(testZapProvider.endpoint_params[0]);
     const param2 = await registryWrapper.getNextEndpointParams({
        provider:accounts[0],
        endpoint:testZapProvider.endpoint,
        index:1})
     await expect(param2).to.be.equal(testZapProvider.endpoint_params[1]);
 });

    it('Should initiate Provider curve in zap registry contract', async () => {
        let thisCurve = testZapProvider.curve;
        let tx = await registryWrapper.initiateProviderCurve({
            endpoint: testZapProvider.endpoint,
            term: testZapProvider.curve.values,
            from: accounts[0],
            gas: 3000000
        });
        expect(tx).to.include.keys("events");
        expect(tx.events).to.include.keys("NewCurve");
        expect(tx.events.NewCurve).to.include.keys("returnValues");
        let returnValues = tx.events.NewCurve.returnValues;
        expect(returnValues).to.include.keys("provider","endpoint","curve")
        expect(returnValues.provider).to.equal(accounts[0]);
        expect(testZapProvider.endpoint).to.equal(hexToUtf8(returnValues.endpoint));
        expect(returnValues.curve).to.deep.equal(testZapProvider.curve.values.map((i:number)=>{return ''+i}))
        const c = await registryWrapper.getProviderCurve(accounts[0], testZapProvider.endpoint);
        await expect(c).to.deep.equal(thisCurve);
    });

    it('Should set endpoint endpointParams in zap registry contract', async () => {
        let result = await registryWrapper.setEndpointParams({
            endpoint: testZapProvider.endpoint,
            endpoint_params: testZapProvider.endpoint_params,
            from: accounts[0],
            gas: 600000
        });

    });


    after(function () {
        ganacheServer.close();
            // clearBuild(false);
            console.log('Server stopped!');
        })
});

