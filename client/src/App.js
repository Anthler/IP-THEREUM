import React, { Component } from "react";
import contractInstance from "./contracts/notary";
import web3 from "./web3/web3";
import ipfs from "./ipfs";

import "./App.css";

class App extends Component {
  state = {
    buffer: null,
    fileDescription: "",

    account: "",
    notary: {},
    filesArr: [],
    filesObjects: [],
    eventNotaryAdded: {},
    fileId: null,
    success: false,
    fileAvailable: false
  };

  async componentDidMount() {
    try {
      const accounts = await web3.eth.getAccounts();
      this.setState({ account: accounts[0] });
    } catch (error) {
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

        contractInstance.events
          .NotaryAdded((error, event) => {})
          .on("data", event => {
            this.setState({
              eventNotaryAdded: {
                id: event.returnValues.id,
                owner: event.returnValues._owner,
                ipfsHash: event.returnValues._ipfsHash,
                timestamp: event.returnValues._timeStamp
              }
            });
            this.setState({ success: true });
          })
          .on("error", error => {
            console.log(error);
          });
      } catch (error) {
        //console.log(error);
      }
    });
  };

  updateDescription = event => {
    this.setState({ fileDescription: event.target.value });
  };

  updateFileId = event => {
    this.setState({ fileId: event.target.value });
  };

  getFileById = () => {
    const fileId = this.state.fileId;

    contractInstance.methods
      .viewNotaryEntry(fileId)
      .call()
      .then(result => {
        var jsonNotary = {
          fileId: result[0],
          description: result[1],
          hash: result[2],
          timeStamp: result[3],
          fileOwner: result[4]
        };
        this.setState({ notary: jsonNotary });
        this.setState({ fileAvailable: true });
      });
  };

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
            });
        }
      });
  }

  render() {
    const { id, owner, ipfsHash, timestamp } = this.state.eventNotaryAdded;
    const {
      fileId,
      description,
      hash,
      timeStamp,
      fileOwner
    } = this.state.notary;

    return (
      <div className="container d-flex flex-column ">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <br />
            <h2>IPTHEREUM NOTARY (PoE)</h2>

            <br />
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-6">
            <br />
            <h4>Get File Details</h4>

            <br />

            <div className="form-group">
              <label htmlFor="exampleFormControlFile1">File ID</label>
              <input
                className="form-control form-control-sm"
                onChange={this.updateFileId}
                type="text"
                placeholder="Enter File Id"
              />
            </div>
            <button className="btn btn-primary" onClick={this.getFileById}>
              {" "}
              Get File Info
            </button>
          </div>
        </div>
        <br />
        <hr />
        <div>
          {this.state.fileAvailable ? (
            <div className="row justify-content-center">
              <div className="col-md-6">
                <h4> File Full Details</h4>
                <p> File ID: {fileId} </p>
                <p> Owner: {fileOwner} </p>
                <p> Description: {description} </p>
                <p>IPFS Hash: {hash}</p>
                <p> Date Uploaded: {timeStamp} </p>
              </div>
            </div>
          ) : null}
          <hr />
        </div>
        <div className="row justify-content-center">
          {this.state.success ? (
            <div className="col-md-6">
              <div className="alert alert-success" role="alert">
                Your file was successfully saved to the ethereum blockchain,
                here is your file details: File Id: {id}, File Owner Address:{" "}
                {owner}, IPFS Hash: {ipfsHash}, Timestamp: {timestamp}
              </div>
            </div>
          ) : null}
        </div>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <br />
            <h2> UPLOAD A FILE TO IPTHEREUM</h2>

            <br />
          </div>
          <div className="col-md-8">
            <form onSubmit={this.onSubmit}>
              <label htmlFor="exampleFormControlFile1"> Choose File</label>
              <input
                type="file"
                className="form-control-file"
                onChange={this.captureFile}
                id="exampleFormControlFile1"
              />
              <div className="form-group">
                <label htmlFor="exampleFormControlTextarea1">
                  File Description
                </label>
                <textarea
                  className="form-control"
                  id="exampleFormControlTextarea1"
                  onChange={this.updateDescription}
                  rows="3"
                />
              </div>
              <input type="submit" className="btn btn-primary" />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
