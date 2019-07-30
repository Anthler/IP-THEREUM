import web3 from "../web3/web3";
import NotaryAbi from "./Notary.json";

const contractAddr = "0xe1c92b47c8f6b0c5a016867ba76e28cc653654b9";
//0xB36023D6626841e825b99eF410F2fB84a9B9c970

const contractInstance = new web3.eth.Contract(NotaryAbi, contractAddr);
contractInstance.methods
  .getFilesCount()
  .call()
  .then(n => console.log(n));
console.log(contractInstance);
export default contractInstance;
