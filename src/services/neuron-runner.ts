import * as os from "os";
import {platform, retry, timeout} from "../utils/utils";
import * as path from "path";
import {cpSync, rmSync} from "node:fs";
import {ChildProcess, exec,spawn} from "child_process";
import * as  fs from "fs";
import {DEV_TIP_NUMBER} from "../config/constant";


let neuron: ChildProcess | null = null

let syncResult: boolean

export const getNeuronPath = () => {
    switch (platform()) {
        case 'win':
            throw new Error("not support ")
        case 'mac':
            //todo check intel
            return path.join(os.homedir(), ...["Library", "Application Support", "Neuron"])
        default:
            throw new Error("not support ")
    }
}

export const startNeuronWithConfig = async (option: {
    envPath: string,
    network: {
        indexJsonPath: string,
        selectNetwork?: string
    },
    wallets: {
        walletsPath: string,
        selectWallet?: string
    },
    cleanCells: boolean
    logPath: string
    neuronCodePath: string
}) => {
    syncResult = false;
    console.log("start neuron")

    if (option.cleanCells) {
        cleanNeuronSyncCells()
    }
    // cp env
    cpSync(option.envPath, path.join(option.neuronCodePath, ...["packages", "neuron-wallet", ".env"]))

    // cp network file
    let decPath = path.join(getNeuronPath(), ...["test", "networks", "index.json"])
    cpSync(option.network.indexJsonPath, decPath)

    if (option.network.selectNetwork !== undefined) {
        //todo
        changeNetworkByName(option.network.selectNetwork)
    }
    // cp wallet file
    cpSync(option.wallets.walletsPath, path.join(getNeuronPath(), ...["test", "wallets"]), {recursive: true})

    if (option.wallets.selectWallet !== undefined) {
        changeWalletByName(option.wallets.selectWallet)
    }

    // start
    const options = ['start:wallet']
    neuron = spawn("yarn", options, {
        cwd: option.neuronCodePath,
        stdio: ['ignore', 'pipe', 'pipe'],
        // detached: true,
        // shell: false,
    })
    let log = fs.createWriteStream(option.logPath)
    neuron.stderr && neuron.stderr.on('data', data => {
        log.write(data)
    })
    neuron.stdout && neuron.stdout.on('data', data => {
        if (!syncResult && data.toString().includes("saved synced block")) {
            syncResult = checkLogForNumber(data.toString())
        }
        log.write(data)
    })

}

function checkLogForNumber(log: string): boolean {
    const regex = /#(\d+)/; // 匹配日志中的数字
    const match = log.match(regex);
    if (match) {
        const number = parseInt(match[1], 10); // 获取匹配到的数字部分
        console.log(`neuron sync:${number}`)
        return number > DEV_TIP_NUMBER; // 检查数字是否大于 20000
    }

    return false; // 如果没有找到匹配的数字，则返回 false
}

export const waitNeuronSyncSuccess = async (retries: number) => {
    await retry(
        () => {
            if (!syncResult) return Promise.reject("waitNeuronSyncSuccess time out ");
            return syncResult;
        }, {
            timeout: retries * 1000,
            delay: 1000,
            retries: retries,
        }
    );

}


export const stopNeuron = async () => {
    console.log("stop neuron")
    await findAndKillProcessOnPort(5858)
    return new Promise<void>(resolve => {
        if (neuron) {
            console.info('neuron:\tkilling neuron')
            neuron.once('close', () => resolve())

            neuron.kill()
            console.log("neuron: stop succ")
            neuron = null
            syncResult = false
        } else {
            resolve()
        }
    })
}

function changeNetworkByName(selectNetwork: string) {

}

function changeWalletByName(selectWallet: string) {

}

export const cleanNeuronSyncCells = () => {
    rmSync(path.join(getNeuronPath(), ...["test", "cells"]), {
        force: true,
        recursive: true
    })
}


export const backupNeuronCells = (decPath: string) => {
    cpSync(path.join(getNeuronPath(), ...["test", "cells"]), decPath, {recursive: true})
}

export function asyncSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findAndKillProcessOnPort(portNumber: number): Promise<void> {
    switch (platform()) {
        case 'win':
            // todo support
            throw new Error("not support ")
        default:
            await exec(`kill $(lsof -t -i:${portNumber})`)
    }
}