import {queryDatabase, compareDatabases} from "../services/sqlite3-server";

describe('query sqlite3', function () {


    it("query blake160 of asset_account", async () => {
        const fullNode_dbPath = "data/fullNode/wallet1/cell0-0x9c96d0b369b5fd42d7e6b30d6dfdb46e32dac7293bf84de9d1e2d11ca7930717.sqlite";
        const tableName = 'asset_account';
        const columnName = 'blake160';
        try{
            const values = await queryDatabase(fullNode_dbPath, tableName, columnName);
            console.log(`${columnName} values in ${tableName}:`, values);
        } catch (error) {
            console.error("Error query database:", error);
        }

    })

    it("compare old to new asset_account", async () => {
        // init db is default, after new db compare to the init
        const dbPath1 = "data/fullNode/wallet1/cell0-0x9c96d0b369b5fd42d7e6b30d6dfdb46e32dac7293bf84de9d1e2d11ca7930717.sqlite";
        const dbPath2 = "data/fullNode/wallet1/cell2-0x9c96d0b369b5fd42d7e6b30d6dfdb46e32dac7293bf84de9d1e2d11ca7930717.sqlite";
        try {
            const result = await compareDatabases(dbPath1, dbPath2);
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