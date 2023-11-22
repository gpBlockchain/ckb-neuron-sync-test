import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    verbose: true,
    transform: {
        // '^.+\\.ts$': 'ts-jest',
        '^.+\\.tsx?$': 'ts-jest',

    },
    testMatch: [
        '**/*.test.(ts|tsx|js)'
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],


    // setupFilesAfterEnv: ['./jest.setup.ts'], // Replace with your test setup file name and path
    // "reporters": [
    //     "default",
    //     ["./node_modules/jest-html-reporter", {
    //         "pageTitle": "Test Report"
    //     }]
    // ],
    testTimeout:1000000,
};

export default config;