import { ethers, network } from "hardhat";
import getWeth from "./getWeth";
import { networkConfig } from "../helper-hardhat-config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

const chainId: number = network.config.chainId!;

async function main() {
    console.log("Tradeing ETH for WETH ...");
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId: number = network.config.chainId!;
    const wethAddress = networkConfig[chainId].token.address;
    const amount = networkConfig[chainId].token.amount;
    await getWeth(wethAddress, deployer, amount);
    console.log("Got WETH!");

    console.log("Getting lending pool ov Aave ...");
    const lendingPool = await getLendingPool(deployer);
    console.log(`LendingPool address: ${lendingPool.address}`);

    console.log("Approve and deposit WETH to Aave ...");
    await apporveErc20(wethAddress, lendingPool.address, amount, deployer);
    console.log("Deploing ...");
    await lendingPool.deposit(wethAddress, amount, deployer.address, 0);
    console.log("Deposited!");
}

async function getLendingPool(account: SignerWithAddress) {
    const lendingPoolAddressesProviderAddress =
        networkConfig[chainId].lendingPoolAddressesProviderAddress;
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        lendingPoolAddressesProviderAddress!
    );
    const lendingPoolAddress =
        await lendingPoolAddressesProvider.getLendingPool();

    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    );
    return lendingPool;
}

async function apporveErc20(
    erc20Address: string,
    spenderAddress: string,
    amountToSpend: BigNumber,
    account: SignerWithAddress
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        account
    );
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Appoved!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
