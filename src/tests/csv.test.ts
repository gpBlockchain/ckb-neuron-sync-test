import {exportToCSVFiles} from "../services/sqlite3-server";

describe('csv', function () {


    it.skip("tocsv", async () => {
        await exportToCSVFiles({
            descPath: "tmp/fullNode",
            sqlPath: "tmp/fullNode/wallet1/cell0-0x9c96d0b369b5fd42d7e6b30d6dfdb46e32dac7293bf84de9d1e2d11ca7930717.sqlite"
        })
    })


});