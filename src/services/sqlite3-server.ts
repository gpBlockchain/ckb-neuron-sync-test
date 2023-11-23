import * as sqlite3 from 'sqlite3';
import * as fs from 'fs';

import * as path from "path";
import Table from 'cli-table3';
import chalk from 'chalk';

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

// 定义异步查询数据库的方法
interface TableRow {
    [key: string]: string;
}

export async function queryDatabase(dbPath: string, tableName: string, columnName: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        // 创建 SQLite 数据库连接
        const db = new sqlite3.Database(dbPath);

        // 编写 SQL 查询语句
        const sql = `SELECT ${columnName} FROM ${tableName}`;

        // 执行查询
        db.all(sql, [], (err, rows: TableRow[]) => {
            // 关闭数据库连接
            db.close();

            if (err) {
                reject(err);
            } else {
                // 提取查询结果中的指定列的值
                const values = rows.map((row) => row[columnName]);
                resolve(values);
            }
        });
    });
}

interface TableColumn {
    name: string;
    type: string;
}

interface TableInfo {
    tableName: string;
    columns: TableColumn[];
}


async function getTableInfo(dbPath: string): Promise<TableInfo[]> {
    return new Promise<TableInfo[]>((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        const sql = "SELECT name FROM sqlite_master WHERE type='table'";
        db.all(sql, [], (err, rows: { name: string }[]) => {
            if (err) {
                reject(err);
            } else {
                const tables: TableInfo[] = [];

                rows.forEach((row) => {
                    const tableName = row.name;
                    const tableColumns: TableColumn[] = [];

                    const columnsSql = `PRAGMA table_info("${tableName}")`;
                    db.all(columnsSql, [], (columnsErr, columnsRows: { name: string }[]) => {
                        if (columnsErr) {
                            console.error('Error fetching columns:', columnsErr);
                            reject(columnsErr);
                        } else {
                            // console.log('Columns fetched successfully:', columnsRows);
                            columnsRows.forEach((columnRow) => {
                                tableColumns.push({
                                    name: columnRow.name,
                                    type: '',
                                });
                            });

                            tables.push({
                                tableName,
                                columns: tableColumns,
                            });

                            if (tables.length === rows.length) {
                                db.close();
                                resolve(tables);
                            }
                        }
                    });
                });
            }
        });
    });
}

export async function compareDatabases(dbPath1: string, dbPath2: string): Promise<string> {
    try {
        const tables1 = await getTableInfo(dbPath1);
        const tables2 = await getTableInfo(dbPath2);

        // 获取所有表的列名
        const allColumns: string[] = [];
        tables1.forEach((table) => {
            table.columns.forEach((column) => {
                const columnName = `${table.tableName}.${column.name}`;
                if (!allColumns.includes(columnName)) {
                    allColumns.push(columnName);
                }
            });
        });

        // 创建表格
        const table = new Table({
            head: ['Column', `(db1) Value`, `(db2) Value`, 'Different'],
            colWidths: [30, 40, 40, 20],
        });

        // 比较两个数据库中每个表的字段是否一致
        const commonTables = tables1.filter((table1) => tables2.some((t) => t.tableName === table1.tableName));

        await Promise.all(commonTables.map(async (table1) => {
            const table2 = tables2.find((t) => t.tableName === table1.tableName);

            if (table2) {
                await Promise.all(table1.columns.map(async (column) => {
                    const columnName = `${table1.tableName}.${column.name}`;
                    const value1 = await getTableColumnValue(dbPath1, table1.tableName, column.name);
                    const value2 = await getTableColumnValue(dbPath2, table1.tableName, column.name);

                    let isDifferent: string | boolean = value1 !== value2;

                    // 特殊处理的列名
                    const specialColumns = [
                        'indexer_tx_hash_cache.createdAt',
                        'indexer_tx_hash_cache.updatedAt',
                        'sync_info.value',
                        'transaction.createdAt',
                    ];

                    if (specialColumns.includes(columnName) && isDifferent) {
                        // 如果是特殊列名，且值不一致，标记为 "NT" (Not Tested)
                        isDifferent = 'NT';
                    }

                    // 将比较结果添加到表格中
                    const row = [columnName, value1, value2, isDifferent ? chalk.red(isDifferent) : 'FALSE'];
                    table.push(row);
                }));
            }
        }));

        // 返回表格字符串
        return table.toString();
    } catch (error) {
        console.error('Error comparing databases:', error);
        throw error;
    }
}




async function getTableColumnValue(dbPath: string, tableName: string, columnName: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);

        const sql = `SELECT "${columnName}" FROM "${tableName}" LIMIT 1`;
        db.get(sql, [], (err, row: any) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(row ? row[columnName] : 'NULL');const value = row ? row[columnName] : null;
                resolve(value !== undefined ? value : 'NULL');
            }
        });
    });
}


