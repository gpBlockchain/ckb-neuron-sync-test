import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';

import * as path from "path";

export const exportToCSVFiles = async (option: {
    sqlPath: string,
    descPath: string
}) => {

    //connect
    const db = new sqlite3.Database(option.sqlPath); // 替换为你的 SQLite 数据库文件路径
    let tableNames = await getAllTableNames(db)
    tableNames.forEach( (tableName)=>{
        console.log(tableName)
        exportToCSV(db,tableName,path.join(option.descPath,`${tableName}.csv`))
        console.log(`${tableName} succ`)
    })
}
async function getAllTableNames(db:sqlite3.Database):Promise<string[]> {
    // return new Promise<string[]>((resolve, reject) => {
    //     db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    //         if (err) {
    //             reject(err);
    //             return;
    //         }
    //
    //         if (rows.length === 0) {
    //             resolve([]);
    //             return;
    //         }
    //
    //         // @ts-ignore
    //         const tableNames = rows.map((row) => row.name);
    //         resolve(tableNames);
    //     });
    // });
    return [
        "migrations",
        "sqlite_sequence",
        "transaction",
        "sync_info",
        "input",
        "output",
        "sudt_token_info",
        "asset_account",
        "indexer_tx_hash_cache",
        "tx_description",
        "address_description",
        "hd_public_key_info",
        "multisig_output",
        "multisig_config",
        "tx_lock",
        "sync_progress"
    ]

}

function exportToCSV(db:sqlite3.Database,tableName:string,csvFilePath:string) {
    // const csvFilePath = 'output.csv'; // 输出 CSV 文件路径和名称
    const query = `SELECT * FROM ${tableName}`;
    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        if (rows.length === 0) {
            console.log(`No data found in table ${tableName}.`);
            return;
        }

        // @ts-ignore
        const headers = Object.keys(rows[0]);
        const csvContent = `${headers.join(',')}\n`;

        const rowsContent = rows.map((row) => {
            // @ts-ignore
            return headers.map((header) => row[header]).join(',');
        }).join('\n');

        const csvData = `${csvContent}${rowsContent}`;

        fs.writeFile(csvFilePath, csvData, (error) => {
            if (error) {
                console.error('Error writing CSV file:', error);
                return;
            }
            console.log(`Data from table ${tableName} exported to ${csvFilePath} successfully.`);
        });
    });

}
