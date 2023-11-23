import {cleanCkbNode, startCkbMiner, startCkbNodeWithData, stopCkbNode} from "../services/ckb-runner";
import {cleanLightCkbNode, startCkbLightNodeWithConfig, stopLightCkbNode} from "../services/light-runner";
import {
    asyncSleep,
    backupNeuronCells,
    startNeuronWithConfig, stopNeuron, waitNeuronSyncSuccess,
} from "../services/neuron-runner";



describe('demo', function () {

    afterEach(async () => {
        await stopCkbNode()
        await stopLightCkbNode()
        await asyncSleep(5*1000)
        await cleanCkbNode("tmp/ckb")
        await cleanLightCkbNode("tmp/ckb-light-client")
        await stopNeuron()
        console.log("clean data successful")
    })

    beforeEach(async ()=>{
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
        // let endTime = now()
        // console.log(`sync succ:${endTime - beginTime}`)
        console.log("back log")
        await backupNeuronCells("tmp/fullNode/wallet1")
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
        await waitNeuronSyncSuccess(30 * 60)
        // await asyncSleep(1000*10)
        console.log("back log ")
        await backupNeuronCells("tmp/lightNode/wallet1")
    })


});