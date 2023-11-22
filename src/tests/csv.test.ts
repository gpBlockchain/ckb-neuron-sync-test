import {exportToCSVFiles} from "../services/sqlite3-server";

describe('csv', function () {


    it("tocsv", async () => {
        await exportToCSVFiles({
            descPath: "tmp/demo1234",
            sqlPath: "tmp/demo1234/cell-0x9c96d0b369b5fd42d7e6b30d6dfdb46e32dac7293bf84de9d1e2d11ca7930717.sqlite"
        })
    })


});