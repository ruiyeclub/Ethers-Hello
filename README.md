> 📝 学习Ethers.js基础内容，使用JavaScript脚本与以太坊交互！
> 内容来自`WTF` ，仓库记录学习过程。
>
> [官方文档](https://www.wtf.academy/docs/ethers-101/) [官方仓库](https://github.com/WTFAcademy/WTF-Ethers)



## 一、Hello Vitalik

初次使用`ethers.js	`库，编写第一个程序：查询V神钱包ETH余额。

需要事先安装好node.js，然后创建node项目：

```js
npm init
```

然后再安装ethers.js：

```js
npm install ethers@6.2.3 --save
```

再编写代码：

```js
import { ethers } from "ethers";

const ETH_MAINNET_URL = 'https://rpc.ankr.com/eth';
const provider = new ethers.JsonRpcProvider(ETH_MAINNET_URL)

const main = async () => {
    const balance = await provider.getBalance(`vitalik.eth`);
    console.log(`ETH Balance of vitalik: ${ethers.formatEther(balance)} ETH`);}
main()
```

这样，你就能在控制台中看到v神的`ETH`余额了：`1951 ETH`。当然这不是v神的全部持仓，他有多个钱包，`vitalik.eth`应该只是他用的比较频繁的一个热钱包。



## 二、提供器 Provider

`Provider`类是对以太坊网络连接的抽象，为标准以太坊节点功能提供简洁、一致的接口。在`ethers`中，`Provider`不接触用户私钥，只能读取链上信息，不能写入，这一点比`web3.js`要安全。

`ethers`中最常用的是`jsonRpcProvider`，可以让用户连接到特定节点服务商的节点。

```js
import { ethers } from "ethers";

// 利用公共rpc节点连接以太坊网络
const ETH_MAINNET_URL = 'https://rpc.ankr.com/eth';
const ETH_TESTNET_URL = 'https://rpc.sepolia.org';
// 连接以太坊主网
const providerETH = new ethers.JsonRpcProvider(ETH_MAINNET_URL)
// 连接Sepolia测试网
const providerSepolia = new ethers.JsonRpcProvider(ETH_TESTNET_URL)

const main = async () => {
    // 利用provider读取链上信息
    // 1.查询vitalik在主网和Sepolia测试网的ETH余额
    const balance = await providerETH.getBalance(`vitalik.eth`);
    const balanceSepolia = await providerSepolia.getBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')
    // 将余额输出在console（主网）
    console.log(`ETH Balance of vitalik: ${ethers.formatEther(balance)} ETH`)
    // 输出Sepolia测试网ETH余额
    console.log(`Sepolia ETH Balance of vitalik: ${ethers.formatEther(balanceSepolia)} ETH`)

    // 2.查询provider连接到了那条链
    const network = await providerETH.getNetwork();
    console.log(`查询provider连接到了哪条链: `)
    console.log(network.toJSON())

    // 3.查询区块高度
    const blockNumber = await providerETH.getBlockNumber();
    console.log(`查询当前最新的区块高度: ${blockNumber}`)

    // 4.查询 vitalik 钱包历史交易次数
    const txCount = await providerETH.getTransactionCount('vitalik.eth');
    console.log(`查询 vitalik 钱包历史交易次数: ${txCount}`);
    
    // 5.查询当前建议的gas设置
    const feeData = await providerETH.getFeeData();
    console.log(`查询当前建议的gas设置: `)
    console.log(feeData)

    // 6.查询指定区块信息
    const block = await providerETH.getBlock(blockNumber); 
    console.log(`查询区块信息: `)
    console.log(block)

    // 7.给定合约地址查询合约bytecode，例子用的WETH
    const code = await providerETH.getCode("0xc778417e063141139fce010982780140aa0cd5ab")
    console.log(`给定合约地址查询合约bytecode，例子用的是WETH: ${code}`)
}
main()
```

> ethers v6版本, 以上代码中`network`不能直接`console.log()`, 具体原因参考: [discussion-3977](https://github.com/ethers-io/ethers.js/discussions/3977)

这一讲，我们将介绍ethers.js的`Provider`类，并用节点创建了`jsonRpcProvider`，读取了`ETH`主网和`Goerli`测试网的链上信息。
