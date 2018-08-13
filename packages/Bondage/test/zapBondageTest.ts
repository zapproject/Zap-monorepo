import {join} from "path";
const expect = require("chai")
.use(require("chai-as-promised"))
.use(require("chai-bignumber"))
.expect;
const Web3 = require("web3");

import {BigNumber} from "bignumber.js";

import {BaseContract} from "@zapjs/basecontract";
import {Utils} from "@zapjs/utils";
import {ZapBondage} from "../src";
import {bootstrap} from "./utils/setup_test";

async function configureEnvironment(func: Function) {
    await func();
}

describe('Zap Bondage Test', () => {
    let accounts: string[] = [],
    ganacheServer: any,
    bondageWrapper: any,
    deployedBondageStorage: any,
    deployedRegistry: any,
    deployedToken: any,
    deployedBondage: any,
    web3: any,
    testArtifacts,
    buildDir: string = join(__dirname, "contracts"),
    requiredZap: number,
        testZapProvider = Utils.Constants.testZapProvider;
    const options: any = {
        artifactsDir: buildDir,
        networkId: Utils.Constants.ganacheServerOptions.network_id,
        networkProvider: Utils.Constants.ganacheProvider,
    };

    before(function(done) {
        configureEnvironment(async () => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            // delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(buildDir);
            testArtifacts = Utils.getArtifacts(buildDir);
            deployedBondage = new BaseContract(Object.assign(options, {artifactName: "Bondage"}));
            deployedRegistry = new BaseContract(Object.assign(options, {artifactName: "Registry"}));
            deployedToken = new BaseContract(Object.assign(options, {artifactName: "ZapToken"}));
            done();
        });
    });

    after(function(){
        console.log("Done running Bondage tests");
        ganacheServer.close();
        process.exit();
    });

    it("1) Should have all pre conditions set up for bondage to work", async () => {
            await bootstrap(testZapProvider, accounts, deployedRegistry, deployedBondage, deployedToken);
        });
    it("2) Should initiate Bondage Wrapper", async () => {
            bondageWrapper = new ZapBondage(options);
        });
    it("3) Should have no bound dots for new provider", async () => {
            const boundDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(boundDots).to.equal(0);
        });

    it("4) Check that total bound zap of unbonded provider is 0", async function() {
            const boundZap = await bondageWrapper.getZapBound({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(boundZap.toString()).to.equal("0");
        });

    it("5) Should calculate the correct amount of Zap for 5 dots", async () => {
            requiredZap = await bondageWrapper.calcZapForDots({
                provider: accounts[0],
                endpoint : testZapProvider.endpoint,
                dots: 5,
            });

            expect(requiredZap).to.equal(85);
        });
    it("6) calcBondRate should return the 5 dots for that amount of Zap", async () => {
        //REMOVED
        //     const calcDots = await bondageWrapper.calcBondRate({
        //         provider: accounts[0],
        //         endpoint: testZapProvider.endpoint,
        //         zapNum: requiredZap,
        //     });
        //     expect(calcDots).to.equal(5);
        });

    it("7) Should bond required Zap to get 5 dots", async () => {
            const approval = await deployedToken.contract.methods.allowance(accounts[2], deployedBondage.contract._address).call().valueOf();
            console.log("required zap : ", requiredZap)
            // approve
            await deployedToken.contract.methods.approve(deployedBondage.contract._address, requiredZap).send({from: accounts[2], gas: Utils.Constants.DEFAULT_GAS});

            const bonded = await bondageWrapper.bond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 5,
                from: accounts[2],
            });
            const numZap = bonded.events.Bound.returnValues.numZap;
            const numDots = bonded.events.Bound.returnValues.numDots;

            let boundDots = await bondageWrapper.getBoundDots({
                subscriber : accounts[2],
                provider: accounts[0],
                endpoint: testZapProvider.endpoint
            })
        console.log("bound dots :", boundDots )
        expect(numZap).to.equal("85");
        expect(numDots).to.equal("5");
        return ;
        });

    it("8) Should unbond 1 dots and return the right amount of zap", async () => {
            const preAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call().valueOf();

            const unbonded = await bondageWrapper.unbond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1,
                from: accounts[2],
            });

            const postAmt = await deployedToken.contract.methods.balanceOf(accounts[2]).call();
            const diff = new BigNumber(postAmt).minus(new BigNumber(preAmt)).toString();
            expect(diff).to.equal("35");
        });

    it("9) Should calculate the correct cost for another dot", async () => {
            // const calcDots = await bondageWrapper.calcBondRate({
            //     provider: accounts[0],
            //     endpoint: testZapProvider.endpoint,
            //     zapNum: 35,
            // });
            //
            // expect(calcDots).to.equal(1);
        });

    it("10) Check that issued dots will increase with every bond", async () => {
            const startDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});

            await deployedToken.contract.methods.approve(deployedBondage.contract._address, 50).send({from: accounts[2], gas: Utils.Constants.DEFAULT_GAS});
            const bonded = await bondageWrapper.bond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1,
                from: accounts[2],
            });

            const finalDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(finalDots - startDots).to.equal(1);
        });

    it("11) Check that issued dots will decrease with every unbond", async () => {
            const startDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            const unbonded = await bondageWrapper.unbond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 1,
                from: accounts[2],
            });

            const finalDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(finalDots - startDots).to.equal(-1);
        });

    it("12) Check that you cannot unbond more dots than you have", async () => {
        const startDots:number = await bondageWrapper.getBoundDots({
                subscriber: accounts[2],
                provider: accounts[0],
                endpoint: testZapProvider.endpoint
            });
        try{
            await bondageWrapper.unbond({
                provider: accounts[0],
                endpoint: testZapProvider.endpoint,
                dots: 100,
                from: accounts[2],
            });
        }catch(e){
            expect(e.toString()).to.include("revert")
            const finalDots = await bondageWrapper.getBoundDots({subscriber: accounts[2], provider: accounts[0], endpoint: testZapProvider.endpoint});
            expect(finalDots).to.equal(startDots);
        }

        });

        /* Can't figure out how to get this working
        it("13) Check that bonding without approval will fail", async() => {
            let allowance = await deployedToken.contract.methods.allowance(accounts[2],deployedBondage.contract._address).call().valueOf();
            if(allowance > 0) await deployedToken.contract.methods.decreaseApproval(deployedBondage.contract, allowance, {from: accounts[2]});

            // will revert
            await expect(function(){
                bondageWrapper.bond({
                    provider:accounts[0],
                    endpoint:testZapProvider.endpoint,
                    zapNum:100,
                    from:accounts[2]
                });
            }).to.throw(Error);
        });
        */

});
