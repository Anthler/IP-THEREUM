import web3 from "../web3/web3";
import NotaryAbi from "./Notary.json";

const contractAddr = "0xe1c92b47c8f6b0c5a016867ba76e28cc653654b9";

const contractInstance = new web3.eth.Contract(NotaryAbi, contractAddr);

export default contractInstance;
