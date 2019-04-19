import {Utils} from "@zapjs/utils";

const expect = require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber'))
.expect;

import {ZapToken} from "../src"
import {join} from "path";
const Web3 = require('web3');
const BigNumber = require("bignumber.js")

async function configureEnvironment(func:Function) {
    await func();
}
describe('ZapToken, path to "/src/api/contracts/ZapToken"', () => {
    let addressZapToken:string,
    accounts:Array<string> = [],
    zapTokenWrapper:any,
    ganacheServer:any,
    web3:any,
    testArtifacts:any,
    buildDir:string = join(__dirname,"contracts"),
    zapTokenOwner:string;
    const allocateAmount = '1000';


    before(function (done) {
        configureEnvironment(async() => {
            ganacheServer = await Utils.startGanacheServer();
            web3 = new Web3(Utils.Constants.ganacheProvider);
            accounts = await web3.eth.getAccounts();
            //delete require.cache[require.resolve('/contracts')];
            await Utils.migrateContracts(join(__dirname,"contracts"));
            testArtifacts = Utils.getArtifacts(join(__dirname, "contracts"));
            done();
        });
    });

    after(function(){
        console.log("Done running Token tests");
        ganacheServer.close();
        process.exit();
    });

    it('Should initiate wrapper', async () => {
        zapTokenWrapper = new ZapToken({
            artifactsDir : buildDir,
            networkId: Utils.Constants.ganacheServerOptions.network_id,
            networkProvider: Utils.Constants.ganacheProvider});
        await Utils.delay(3000)
        expect(zapTokenWrapper).to.be.ok
        zapTokenOwner = await  zapTokenWrapper.getContractOwner()
    });


    it('Should initiate wrapper with coordinator ', async () => {
        zapTokenWrapper = new ZapToken({
            artifactsDir : buildDir,
            networkId: Utils.Constants.ganacheServerOptions.network_id,
            networkProvider: Utils.Constants.ganacheProvider,
            coordinator:zapTokenWrapper.coordinator._address
        });
        await Utils.delay(3000)
        expect(zapTokenWrapper).to.be.ok
        zapTokenOwner = await  zapTokenWrapper.getContractOwner()
    });

    it('Should get zapToken owner', async () => {
        const owner = await zapTokenWrapper.getContractOwner();

        await expect(owner).to.be.equal(accounts[0]);
    });

    it('Should get balance of zapToken from wrapper', async () => {
        const balance = await zapTokenWrapper.balanceOf(accounts[0]);
        await expect(balance.valueOf()).to.be.equal('0');
    });

    it('Should update balance, and get updated balance of zap token', async () => {
        await zapTokenWrapper.allocate({
            to:accounts[1],
            from:zapTokenOwner,
            amount:allocateAmount}, (err: any, txid: string) => expect(txid).to.be.a('string'));
        const balance = await zapTokenWrapper.balanceOf(accounts[1]);
        await expect(balance).to.be.equal(allocateAmount);
    });

    it('Should make transfer to another account', async () => {
        await zapTokenWrapper.send({
            to: accounts[2],
            amount: allocateAmount,
            from: accounts[1]
        }, (err: any, txid: string) => expect(txid).to.be.a('string'));
        const balance = await zapTokenWrapper.balanceOf(accounts[2]);

        await expect(balance).to.be.equal(allocateAmount);
    });

    it('Should approve to transfer from one to the another account', async () => {
        await zapTokenWrapper.approve({
            to: accounts[2],
            amount: allocateAmount,
            from: accounts[0]
        }, (err: any, txid: string) => expect(txid).to.be.a('string'));
    });
});
