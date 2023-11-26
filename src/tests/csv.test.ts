import {exportToCSVFiles} from "../services/sqlite3-server";
import {backupNeuronCells} from "../services/neuron-runner";
import * as sqlite3 from 'sqlite3';
import fs from 'fs';
import {ComparisonOptions, SQLiteDataComparator} from "../services/SQLiteDataComparator";
import {compareNeuronDatabase} from "../services/neuron-sql-server";

describe('csv', function () {


    it.skip("tocsv", async () => {
        await exportToCSVFiles({
            descPath: "tmp/fullNode",
            sqlPath: "tmp/fullNode/wallet1/cell-0x9c96d0b369b5fd42d7e6b30d6dfdb46e32dac7293bf84de9d1e2d11ca7930717.sqlite"
        })
    })


});