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
