import {cleanCkbNode, startCkbMiner, startCkbNodeWithData, stopCkbNode} from "../services/ckb-runner";
import {cleanLightCkbNode, startCkbLightNodeWithConfig, stopLightCkbNode} from "../services/light-runner";
import {
    backupNeuronCells,
    startNeuronWithConfig, stopNeuron, waitNeuronSyncSuccess,
} from "../services/neuron-runner";
import {
    FULLNODE_DEFAULT_DBPATH,
    FULLNODE_INIT_DBPATH,
    LIGTHNODE_INIT_DBPATH,
    LIGTHNODE_DEFAULT_DBPATH
} from "../config/constant";
import {compareNeuronDatabase} from "../services/neuron-sql-server";


describe('demo', function () {

    afterEach(async () => {
        console.log('after each')
        await stopCkbNode()
        await cleanCkbNode("tmp/ckb")
        await stopLightCkbNode()
        await cleanLightCkbNode("tmp/ckb-light-client")
        await stopNeuron()
        console.log("clean data successful")
    })

    beforeEach(async () => {
        console.log("before each")
        await startCkbNodeWithData({
            binPath: "source/bin",
            dataPath: "source/ckb",
            decPath: "tmp/ckb"
        })
        await startCkbMiner({
            binPath: "source/bin",
            decPath: "tmp/ckb"
        })
        await startCkbLightNodeWithConfig({
            binPath: "source/bin",
            dataPath: "source/ckb-light-client",
            decPath: "tmp/ckb-light-client"
        })
    })

    it("full node sync  wallet 1", async () => {

        await startNeuronWithConfig({
            cleanCells: true,
            envPath: "source/neuron/.env",
            network: {indexJsonPath: "source/neuron/dev-wallet1/dev/networks/index.json"},
            wallets: {
                walletsPath: "source/neuron/dev-wallet1/dev/wallets"
            },
            neuronCodePath: "neuron",
            logPath: "tmp/neuron-full-node-wallet-1.log"
        })
        console.log("wait sync ")
        // let beginTime = now()
        await waitNeuronSyncSuccess(30 * 60)
        await stopNeuron()
        // let endTime = now()
        // console.log(`sync succ:${endTime - beginTime}`)
        console.log("back log")
        await backupNeuronCells("tmp/fullNode/wallet1")
        let result = await compareNeuronDatabase(FULLNODE_INIT_DBPATH, FULLNODE_DEFAULT_DBPATH, "tmp/fullNode/wallet1")
        expect(result).toEqual(true)

    })

    it("light node sync  wallet 1", async () => {

        await startNeuronWithConfig({
            cleanCells: true,
            envPath: "source/neuron/.env",
            network: {indexJsonPath: "source/neuron/dev-wallet1/dev/networks/index.light.json"},
            wallets: {
                walletsPath: "source/neuron/dev-wallet1/dev/wallets"
            },
            neuronCodePath: "neuron",
            logPath: "tmp/neuron-light-node-wallet-1.log"
        })
        console.log("wait sync ")
        await waitNeuronSyncSuccess(60 * 60)
        await stopNeuron()
        console.log("back log")
        await backupNeuronCells("tmp/lightNode/wallet1")
        console.log("finished")
        const result = await compareNeuronDatabase(LIGTHNODE_INIT_DBPATH, LIGTHNODE_DEFAULT_DBPATH, "tmp/lightNode/wallet1");
        expect(result).toEqual(true)
        console.log("compare finished")
    })

});