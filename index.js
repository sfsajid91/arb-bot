require('dotenv').config();
const chalk = require('chalk');
const { ethers } = require('ethers');
const config = require('./config');

const ethProvider = new ethers.providers.WebSocketProvider(config.ethWsProvider); // for checking claimable block
const arbProvider = new ethers.providers.WebSocketProvider(config.arbWsProvider); // for claiming

const arbFoundationContract = new ethers.Contract(
    config.arbFoundationAddress,
    config.arbFoundationAbi,
    arbProvider
);

const wallet = new ethers.Wallet(config.privateKey, arbProvider);

const contractWithSigner = arbFoundationContract.connect(wallet);

const getClaimableBlock = async (clBlock = config.claimableBlock) => {
    // checking current block number on ethereum mainnet until it reaches the claimable block
    const ethBlockNumber = await ethProvider.getBlockNumber();
    if (ethBlockNumber >= clBlock) {
        return ethBlockNumber;
    }
    console.log(
        chalk.yellow(
            `Current block number on Ethereum mainnet: ${ethBlockNumber} - waiting for block ${clBlock}`
        )
    );

    // delay for 1 second to avoid rate limiting
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, config.claimableBlockDelay));

    return getClaimableBlock(clBlock);
};

const getClaimableAmount = async (address = config.myAddress) => {
    const claimableAmount = await arbFoundationContract.claimableTokens(address);
    return claimableAmount;
};

const tokenClaim = async () => {
    // covert gas price to wei
    try {
        const gasPrice = ethers.utils.parseUnits(config.gasPrice, 'gwei');
        const tx = await contractWithSigner.claim({
            gasLimit: config.gasLimit,
            gasPrice,
        });
        console.log(chalk.green(`Transaction hash: ${tx.hash}`));
    } catch (e) {
        console.log(chalk.red(e));
    }
};

const claimArb = async (address = config.myAddress) => {
    const claimableAmount = await getClaimableAmount(address);
    if (claimableAmount > 0) {
        await tokenClaim();
        console.log(chalk.green(`Claimed ${claimableAmount} ARB tokens`));
    } else {
        console.log(chalk.yellow('No claimable amount'));
    }
};

const main = async () => {
    try {
        const block = await getClaimableBlock();
        if (block) {
            await claimArb();
            process.exit(0);
        }
    } catch (e) {
        console.log(chalk.red(e));
    }
};

main();
