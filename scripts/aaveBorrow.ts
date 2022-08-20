import { ethers, network } from "hardhat";
import getWeth from "./getWeth";
import { networkConfig } from "../helper-hardhat-config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ILendingPool } from "../typechain-types";
import { AggregatorV3Interface } from "../typechain-types";

const chainId: number = network.config.chainId!;

async function main() {
    console.log("Trading ETH for WETH ...");
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId: number = network.config.chainId!;
    const wethAddress = networkConfig[chainId].token.address;
    const amount = networkConfig[chainId].token.amount;
    await getWeth(wethAddress, deployer, amount);

    console.log("Getting lending pool of Aave ...");
    const lendingPool = await getLendingPool(deployer);
    console.log(`LendingPool address: ${lendingPool.address}`);

    console.log("Approve and deposit WETH to Aave ...");
    await apporveErc20(wethAddress, lendingPool.address, amount, deployer);
    console.log("Deploing ...");
    await lendingPool.deposit(wethAddress, amount, deployer.address, 0);
    console.log("Deposited!");
    const { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );

    const daiPriceFeedAddress = networkConfig[chainId].daiPriceFeedAddress;
    const daiPrice = await getDaiPrice(daiPriceFeedAddress!);
    const amountDaiToBorrow = availableBorrowsETH
        .div(daiPrice)
        .mul(BigNumber.from("95"))
        .div(BigNumber.from("100"));
    const amountDaiToBorrowWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    );
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);

    // Borrow time
    const daiTokenAddress = networkConfig[chainId].daiTokenAddress!;
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    );
    await getBorrowUserData(lendingPool, deployer);
    await repay(daiTokenAddress, amountDaiToBorrowWei, lendingPool, deployer);
    await getBorrowUserData(lendingPool, deployer);
}

async function repay(
    daiAddress: string,
    amountDaiToRepay: BigNumber,
    lendingPool: ILendingPool,
    account: SignerWithAddress
) {
    await apporveErc20(
        daiAddress,
        lendingPool.address,
        amountDaiToRepay,
        account
    );
    const repayTx = await lendingPool.repay(
        daiAddress,
        amountDaiToRepay,
        1,
        account.address
    );
    await repayTx.wait(1);
    console.log("Repaied!");
}

async function borrowDai(
    daiAddress: string,
    lendignPool: ILendingPool,
    amountDaiToBorrowWei: BigNumber,
    account: SignerWithAddress
) {
    const borrowTx = await lendignPool.borrow(
        daiAddress,
        amountDaiToBorrowWei,
        1,
        0,
        account.address
    );
    await borrowTx.wait(1);
    console.log("You've borrowed!");
}

async function getDaiPrice(daiPriceFeedAddress: string) {
    const daiEthPriceFeed: AggregatorV3Interface = await ethers.getContractAt(
        "AggregatorV3Interface",
        daiPriceFeedAddress
    );
    const price = (await daiEthPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is ${price.toString()}`);
    return price;
}

async function getBorrowUserData(
    ledingPool: ILendingPool,
    account: SignerWithAddress
) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await ledingPool.getUserAccountData(account.address);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
    return { totalDebtETH, availableBorrowsETH };
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
    console.log("Approved!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
