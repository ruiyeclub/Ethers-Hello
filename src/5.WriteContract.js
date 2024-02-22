import { ethers } from "ethers";

const ETH_TESTNET_URL = 'https://rpc.sepolia.org';
const provider = new ethers.JsonRpcProvider(ETH_TESTNET_URL)

const privateKey = '0x227dbb8586117d55284e26620bc76534dfbd2394be34cf4a09cb775d593b6f2b'
const wallet = new ethers.Wallet(privateKey, provider)

// WETH的ABI
const abiWETH = [
    "function balanceOf(address) public view returns(uint)",
    "function deposit() public payable",
    "function transfer(address, uint) public returns (bool)",
    "function withdraw(uint) public",
];

// WETH合约地址（sepolia测试网）
const addressWETH = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'

// 声明可写合约
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet)
// 这是只读合约：const contractWETH = new ethers.Contract(addressWETH, abiWETH, provider)

const main = async () => {
    const walletAddress = await wallet.getAddress();
    // 1. 读取WETH合约的链上信息
    const balanceWETH = await contractWETH.balanceOf(walletAddress)
    console.log(`存款前WETH持仓: ${ethers.formatEther(balanceWETH)}`)
    // 读取钱包内ETH余额
    const balanceETH = await provider.getBalance(wallet)

    // 如果钱包ETH足够
    if (ethers.formatEther(balanceETH) > 0.0015) {
        // 2.调用deposit()函数，将0.001ETH转为WETH
        // 发起交易
        const tx = await contractWETH.deposit({ value: ethers.parseEther("0.001") })
        // 等待交易上链
        await tx.wait()
        console.log(tx)
        // 3. 调用WETH的transfer()函数，将0.001 WETH转账给 vitalik
        console.log("3. 调用transfer()函数，给vitalik转账0.001 WETH")
        // 发起交易
        const tx2 = await contractWETH.transfer("vitalik.eth", ethers.parseEther("0.001"))
        // 等待交易上链
        await tx2.wait()
        const balanceWETH_transfer = await contractWETH.balanceOf(walletAddress)
        console.log(`转账后WETH持仓: ${ethers.formatEther(balanceWETH_transfer)}`)
    } else {
        // 如果ETH不足
        console.log("ETH不足，去水龙头领一些sepolia ETH")
        console.log("1. alchemy水龙头: https://www.alchemy.com/faucets/ethereum-sepolia")
    }

}
main()