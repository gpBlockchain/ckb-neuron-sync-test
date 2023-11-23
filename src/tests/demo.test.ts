import {cleanCkbNode, startCkbMiner, startCkbNodeWithData, stopCkbNode} from "../services/ckb-runner";
import {cleanLightCkbNode, startCkbLightNodeWithConfig, stopLightCkbNode} from "../services/light-runner";
import {
    backupNeuronCells,
    startNeuronWithConfig, stopNeuron, waitNeuronSyncSuccess,
} from "../services/neuron-runner";
import {compareDatabases} from "../services/sqlite3-server";
import {FULLNODE_DEFAULT_DBPATH, FULLNODE_INIT_DBPATH, LIGTHNODE_INIT_DBPATH, LIGTHNODE_DEFAULT_DBPATH} from "../config/constant";



describe('demo', function () {

    afterEach(async () => {
        await stopCkbNode()
        await cleanCkbNode("tmp/ckb")
        await stopLightCkbNode()
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
        // await asyncSleep(1000*10)
        // let endTime = now()
        // console.log(`sync succ:${endTime - beginTime}`)
        console.log("back log")
        await backupNeuronCells("tmp/fullNode/wallet1")
        try {
            const result = await compareDatabases(FULLNODE_DEFAULT_DBPATH , FULLNODE_INIT_DBPATH);
            console.log(result);

            // 进行断言
            if (result.includes('\x1b[31mTRUE\x1b[39m')) {
                // 包含红色标记，断言失败
                console.error('Assertion failed: Databases are different.');
            } else {
                // 不包含红色标记，断言成功
                console.log('Assertion passed: Databases are the same.');
            }
        } catch (error) {
            // 处理错误
            console.error('Error:', error);
        }
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
        try {
            const result = await compareDatabases(LIGTHNODE_INIT_DBPATH , LIGTHNODE_DEFAULT_DBPATH);
            console.log(result);

            // 进行断言
            if (result.includes('\x1b[31mTRUE\x1b[39m')) {
                // 包含红色标记，断言失败
                console.error('Assertion failed: Databases are different.');
            } else {
                // 不包含红色标记，断言成功
                console.log('Assertion passed: Databases are the same.');
            }
        } catch (error) {
            // 处理错误
            console.error('Error:', error);
        }
    })


});