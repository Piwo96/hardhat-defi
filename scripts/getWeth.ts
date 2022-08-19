import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

export default async function getWeth(
    address: string,
    account: SignerWithAddress,
    amount: BigNumber
) {
    const iWeth = await ethers.getContractAt("IWeth", address, account);
    const tx = await iWeth.deposit({ value: amount });
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(account.address);
    console.log(`Got ${wethBalance.toString()} WETH`);
}
