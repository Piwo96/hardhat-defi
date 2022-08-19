import { BigNumber } from "ethers";
import { ethers } from "hardhat";

interface networkConfigInfo {
    [id: number]: networkConfigItem;
}

interface networkConfigItem {
    token: token;
    lendingPoolAddressesProviderAddress?: string;
    erc20Address?: string;
}

type token = {
    name: string;
    address: string;
    amount: BigNumber;
};

export const networkConfig: networkConfigInfo = {
    31337: {
        token: {
            name: "WETH",
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            amount: ethers.utils.parseEther("0.2"),
        },
        lendingPoolAddressesProviderAddress:
            "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        erc20Address: "",
    },
};
