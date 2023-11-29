import { JestConfigWithTsJest } from 'ts-jest';


// jest set NODE_ENV === test
// will make neuron run in test mode, can‘t read local:3000 data
// so should make neuron run in dev mode
process.env = Object.assign(process.env, { NODE_ENV: undefined });

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
    testTimeout:4000000,
};

export default config;