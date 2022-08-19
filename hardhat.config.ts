import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "dotenv/config";
import "hardhat-deploy";

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://ether";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            { version: "0.8.9" },
            { version: "0.4.19" },
            { version: "0.6.12" },
            { version: "0.6.6" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
        },
        rinkeby: {
            chainId: 4,
            accounts: [PRIVATE_KEY],
            url: RINKEBY_RPC_URL,
        },
        localhost: {
            chainId: 31337,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    mocha: {
        timeout: 300000,
    },
};

export default config;
