const config = {
    claimableBlock: 16890400,
    claimableBlockDelay: 3000,
    ethWsProvider: process.env.ETH_WEBSOCKET_ENDPOINT,
    arbWsProvider: process.env.ARB_WEBSOCKET_ENDPOINT,
    arbFoundationAddress: '0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9',
    arbFoundationAbi: [
        'function claim()',
        'function claimableTokens(address) view returns (uint256)',
    ],
    myAddress: process.env.MY_ADDRESS,
    privateKey: process.env.PRIVATE_KEY,
    gasPrice: '0.3',
    gasLimit: 1000000,
};

module.exports = config;
