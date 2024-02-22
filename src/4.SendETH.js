import { ethers } from "ethers";

const ETH_TESTNET_URL = 'https://rpc.sepolia.org';
const provider = new ethers.JsonRpcProvider(ETH_TESTNET_URL)

const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

const main = async () => {
    // 1.获取钱包地址
    const address = await wallet.getAddress()
    console.log(`钱包地址: ${address}`);

    // 2.获取私钥
    console.log(`钱包私钥: ${wallet.privateKey}`)

    // 3. 获取链上发送交易次数    
    const txCount = await provider.getTransactionCount(wallet)
    console.log(`钱包发送交易次数: ${txCount}`)

    // 4.发送ETH
    console.log(`发送ETH`)
    const balance = await provider.getBalance(address);
    if (ethers.formatEther(balance) > 0.0015) {
        const tx = {
            to: '0x527d639B3B95BedFEBeF88F415e8F2B1A9fA477e',
            value: ethers.parseEther('0.000001')
        }
        const receipt = await wallet.sendTransaction(tx)
        await receipt.wait() // 等待链上确认交易
        console.log(receipt) // 打印交易详情
    } else {
        // 如果ETH不足
        console.log("ETH不足，去水龙头领一些sepolia ETH")
        console.log("1. alchemy水龙头: https://www.alchemy.com/faucets/ethereum-sepolia")
    }
}
main()