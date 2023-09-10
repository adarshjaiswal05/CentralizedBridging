
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express')
const bodyparser = require('body-parser')
const app = express();
var Tx = require('ethereumjs-tx').Transaction;




const Web3 = require('web3');
const web31 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/038201137ddc4681ad11d7310daffce6"));
const web32 = new Web3(new Web3.providers.HttpProvider("https://avalanche-fuji.infura.io/v3/038201137ddc4681ad11d7310daffce6"));


const port = 4000;

app.use(express.static("public"));
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

import {addressEth, ABIETH} from "./abiEth.js";
import{addressWETH, ABIWETH} from "./abiWEth.js";

app.post("/call", async (req, res) => {
 
    
    let contractEth;
    let contractWEth;

   
    let amount = req.body.mintamount;

    try{
        transferEthToken(amount)
    }catch(err){
        console.log(err)
    }


    async function transferEthToken(_amount) {
        contractEth = new web31.eth.Contract(ABIETH, addressEth);
        
        var sMsgsender ="0x1A2b5eCd2372E2030115EF0E076778F26C0a8897";
        if(sMsgsender==""){alert('please connect wallet to continue')}

        try {

            contractEth.methods.transfer(adminAddress, _amount).send({ from: sMsgsender })
                .on('transactionHash', function (sHash) {
                    console.log("your transation hash is " + sHash)
                })
                .on('receipt', function (receipt) {
                    if (receipt.status == true && receipt.to==adminAddress) {
                        console.log(receipt)
                        metaTransation(sMsgsender,_amount);

                    } else {
                        console.log('Transaction reverted due to some technical issues.')
                    }
                })
                .catch(function (err) {
                    console.log(err.message)
                })
        } catch (err) {
            console.log(err)
        }
    }

    async function metaTransation(sAddress,nAmount) {

        const PrivateKey="f9269f6382e5d0c0105d1b134105f121552360768efa1c502ec66f4858fd6313";
        var key = new Buffer.from(PrivateKey,'hex');


        contractWEth = new web32.eth.Contract(ABIWETH, addressWETH);

        try {

            const gasPrice = await web32.eth.getGasPrice();
            console.log("gasPrice working " + gasPrice)

            const gasPriceHex = web32.utils.toHex(gasPrice);
            console.log("gasPriceHex working " + gasPriceHex)

            const gasLimitHex = web32.utils.toHex(3000000);
            console.log("gasLimitHex working " + gasLimitHex)

            const Id = await web32.eth.net.getId();
            console.log("Id working " + Id)

            let nonce = await web32.eth.getTransactionCount(adminAddress);
            console.log("nonce working " + nonce)


            var data = contractWEth.methods.mint(sAddress,nAmount).encodeABI();

            console.log(data + " data working")

            var tra = {
                from: adminAddress,
                to: addressWETH,
                nonce: nonce,
                gasPrice: gasPriceHex,
                gasLimit: gasLimitHex,
                data: data,
                cahinId: Id
            }
            console.log("tra working " + tra)

            const tx = new Tx(tra, { 'chain': 'AVAX' });
            console.log(tx + "tx working")

            tx.sign(key);

            console.log("sign working")


            var stx = tx.serialize();

            console.log(stx + "  stx working")

            await web32.eth.sendSignedTransaction('0x' + stx.toString('hex'), (err, hash) => {
                if (err) { console.log(err); return; }
                console.log('contract creation tx: ' + hash);
            });
        } catch (err) {
            console.log(err);
        }
    }


})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
});






