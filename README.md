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
npm install ethers@6.6.4 --save
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

const ETH_MAINNET_URL = 'https://rpc.ankr.com/eth';
// 连接以太坊主网
const providerETH = new ethers.JsonRpcProvider(ETH_MAINNET_URL)

const main = async () => {
    // 1.查询vitalik在主网的ETH余额
    const balance = await providerETH.getBalance(`vitalik.eth`);
    // 将余额输出在console（主网）
    console.log(`ETH Balance of vitalik: ${ethers.formatEther(balance)} ETH`)

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



## 三、读取合约信息

`Contract`对象分为两类，只读和可读写。只读`Contract`只能读取链上合约信息，即调用合约中`view`和`pure`的函数，而不能执行交易`transaction`。创建这两种`Contract`变量的方法有所不同：

- 只读`Contract`：参数分别是合约地址，合约`abi`和`provider`变量（只读）。

```js
const contract = new ethers.Contract(`address`, `abi`, `provider`);
```

- 可读写`Contract`：参数分别是合约地址，合约`abi`和`signer`变量。`Signer`签名者是`ethers`中的一个类，用于签名交易，之后我们会讲到。

```js
const contract = new ethers.Contract(`address`, `abi`, `signer`);
```

我们可以利用只读`Contract`实例调用合约的`view`和`pure`函数，获取链上信息：

```js
import { ethers } from "ethers";

const ETH_MAINNET_URL = 'https://rpc.ankr.com/eth';
const provider = new ethers.JsonRpcProvider(ETH_MAINNET_URL)

// 人类可读abi，以ERC20合约为例
const abiERC20 = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",
];
const addressDAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI Contract
const contractDAI = new ethers.Contract(addressDAI, abiERC20, provider)

const main = async () => {
    // 读取DAI合约的链上信息（IERC20接口合约）
    const nameDAI = await contractDAI.name()
    const symbolDAI = await contractDAI.symbol()
    const totalSupplDAI = await contractDAI.totalSupply()
    console.log("2. 读取DAI合约信息")
    console.log(`合约地址: ${addressDAI}`)
    console.log(`名称: ${nameDAI}`)
    console.log(`代号: ${symbolDAI}`)
    console.log(`总供给: ${ethers.formatEther(totalSupplDAI)}`)
    const balanceDAI = await contractDAI.balanceOf('vitalik.eth')
    console.log(`Vitalik持仓: ${ethers.formatEther(balanceDAI)}\n`)
}
main()
```



## 四、发送ETH

通过`Signer`签名者类和它派生的`Wallet`钱包类，并利用它来发送`ETH`。

### `Signer`签名者类

在`ethers.js`中，`Provider`提供器类管理网络连接状态，`Signer`签名者类或`Wallet`钱包类管理密钥。

在`ehters`中，`Signer`签名者类是以太坊账户的抽象，可用于对消息和交易进行签名，并将签名的交易发送到以太坊网络，并更改区块链状态。`Signer`类是抽象类，不能直接实例化，我们需要使用它的子类：`Wallet`钱包类。

### `Wallet`钱包类

`Wallet`类继承了`Signer`类，并且开发者可以像包含私钥的外部拥有帐户（`EOA`）一样，用它对交易和消息进行签名。

1. 方法1: 创建随机的wallet对象

```js
// 创建随机的wallet对象
const wallet1 = new ethers.Wallet.createRandom()
```

2. 方法2: 用私钥创建wallet对象

```js
// 利用私钥和provider创建wallet对象
const privateKey = '私钥'
const wallet2 = new ethers.Wallet(privateKey, provider)
```

3. 方法3: 从助记词创建wallet对象

```js
// 从助记词创建wallet对象
const wallet3 = new ethers.Wallet.fromMnemonic('助记词')
```

### 发送ETH

我们可以利用`Wallet`实例来发送`ETH`。首先，我们要构造一个交易请求，在里面声明接收地址`to`和发送的`ETH`数额`value`。交易请求`TransactionRequest`类型可以包含发送方`from`，nonce值`nounce`，请求数据`data`等信息，之后的教程里会更详细介绍。

```js
import { ethers } from "ethers";

const ETH_TESTNET_URL = 'https://rpc.sepolia.org';
const provider = new ethers.JsonRpcProvider(ETH_TESTNET_URL)

// 利用私钥和provider创建wallet对象
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
    // 如果这个钱包没goerli测试网ETH，去水龙头领一些，钱包地址：0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2
    // 1. chainlink水龙头: https://faucets.chain.link/goerli
    // 2. paradigm水龙头: https://faucet.paradigm.xyz/
    // i. 打印交易前余额
    console.log(`i. 发送前余额`)
    // ii. 构建交易请求，参数：to为接受地址，value为ETH数额
    const tx = {
        to: 'vitalik.eth',
        value: ethers.parseEther('0.001')
    }
    // iii. 发送交易，获得收据
    const receipt = await wallet.sendTransaction(tx)
    await receipt.wait() // 等待链上确认交易
    console.log(receipt) // 打印交易详情
}
main()
```

这一讲，我们介绍了`Signer`签名者类和`Wallet`钱包类，使用钱包实例获取了地址、助记词、私钥、链上交互次数，并发送`ETH`。



## 五、合约交互

我们将介绍如何声明可写的`Contract`合约变量，并利用它与测试网的`WETH`合约交互。

1. 声明可写的`Contract`变量的规则：

```js
const contract = new ethers.Contract(address, abi, signer)
```

其中`address`为合约地址，`abi`是合约的`abi`接口，`signer`是`wallet`对象。注意，这里你需要提供`signer`，而在声明可读合约时你只需要提供`provider`。

2. 合约交互：

```js
// 发送交易
const tx = await contract.METHOD_NAME(args [, overrides])
// 等待链上确认交易
await tx.wait() 
```

其中`METHOD_NAME`为调用的函数名，`args`为函数参数，`[, overrides]`是可以选择传入的数据，包括：

- gasPrice：gas价格
- gasLimit：gas上限
- value：调用时传入的ether（单位是wei）
- nonce：nonce

**注意：** 此方法不能获取合约运行的返回值，如有需要，要使用`Solidity`事件记录，然后利用交易收据去查询。

3. 调用`WETH`的`deposit()`函数，将`0.001 ETH`转换为`WETH`，并转账给了V神

```js
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
}
main()
```

**注意**：观察`deposit()`函数和`balanceOf()`函数，为什么他们的返回值不一样？为什么前者返回一堆数据，而后者只返回确定的值？这是因为对于钱包的余额，它是一个只读操作，读到什么就是什么。而对于一次函数的调用，并不知道数据何时上链，所以只会返回这次交易的信息。总结来说，就是对于非`pure`/`view`函数的调用，会返回交易的信息。如果想知道函数执行过程中合约变量的变化，可以在合约中使用`emit`输出事件，并在返回的`transaction`信息中读取事件信息来获取相应的值。

