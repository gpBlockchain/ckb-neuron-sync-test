import {exportToCSVFiles} from "../services/sqlite3-server";
import {compareNeuronDatabase} from "../services/neuron-sql-server";
import {LIGTHNODE_DEFAULT_DBPATH, LIGTHNODE_INIT_DBPATH} from "../config/constant";

describe('csv', function () {


    it.skip("tocsv", async () => {
        await exportToCSVFiles({
            descPath: "tmp/fullNode",
            sqlPath: "tmp/fullNode/wallet1/cell-0x9c96d0b369b5fd42d7e6b30d6dfdb46e32dac7293bf84de9d1e2d11ca7930717.sqlite"
        })
    })
    it.skip("compare sql",async ()=>{
       await compareNeuronDatabase(LIGTHNODE_INIT_DBPATH, LIGTHNODE_DEFAULT_DBPATH, "tmp/lightNode/wallet1");
    })


});