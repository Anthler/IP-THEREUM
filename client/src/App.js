import React, { Component } from "react";
import contractInstance from "./contracts/notary";
import web3 from "./web3/web3";
import ipfs from "./ipfs";

import "./App.css";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    buffer: null,
    fileDescription: "",
    total: 0,
    account: "",
    notary: {},
    filesArr: [],
    filesObjects: []
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      this.setState({ account: accounts[0] });

      const total = await contractInstance.methods
        .getFilesCount()
        .call({ from: accounts[0] });
      this.setState({ total });
      this.getFileById(1);
      this.getPersonAllFiles("0x890575aee83e2b50869b3917a77a5578b86b0e98");
    } catch (error) {
      // Catch any errors for any of the above operations.

      console.error(error);
    }
  }

  captureFile = event => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
    };
  };

  onSubmit = event => {
    event.preventDefault();
    ipfs.add(this.state.buffer, (error, results) => {
      if (error) {
        console.error(error);
        return;
      }

      this.setState({ ipfsHash: results[0].hash });
      //console.log(this.state);
      try {
        contractInstance.methods
          .addNotaryEntry(this.state.ipfsHash, this.state.fileDescription)
          .send({ from: this.state.account })
          .then(r => {
            this.setState({ ipfshash: "", fileDescription: "" });
          });
      } catch (error) {
        console.log(error);
      }
    });
  };

  updateDescription = event => {
    this.setState({ fileDescription: event.target.value });
  };

  getFileById(id) {
    const total = this.state.total;
    for (var i = 0; i < total; i++) {
      contractInstance.methods
        .viewNotaryEntry(id)
        .call()
        .then(result => {
          var jsonNotary = {
            id: result[0],
            description: result[1],
            hash: result[2],
            timeStamp: result[3],
            owner: result[4]
          };
          this.setState({ notary: jsonNotary });
          // console.log(this.state.notary);
          return jsonNotary;
        });
    }
  }

  getPersonAllFiles(address) {
    contractInstance.methods
      .getAPersonFiles(address)
      .call()
      .then(filesArr => {
        this.setState({ filesArr });

        for (var i = 1; i <= filesArr.length; i++) {
          contractInstance.methods
            .viewNotaryEntry(i)
            .call()
            .then(fileObject => {
              this.setState({
                filesObjects: [...this.state.filesObjects, fileObject]
              });
              console.log(this.state.filesObjects);
            });
        }
      });
  }

  render() {
    return (
      <div className="App">
        <h1>IPTHEREUM Proof Of Existence</h1>
        {/* <br />
        <img src={`https://ipfs.io/ipfs/${this.state.ipfshash}`} alt="" /> */}
        <br />
        <h2>Upload A File</h2>
        <h5>
          This App uploads your file to IPFS and store it hash on the ethereum
          blockchain
        </h5>
        <form onSubmit={this.onSubmit}>
          <label> Select Your File </label>{" "}
          <input type="file" onChange={this.captureFile} />
          <label>File Description</label>{" "}
          <textarea onChange={this.updateDescription} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default App;
