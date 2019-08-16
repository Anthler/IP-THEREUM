pragma solidity 0.5.1;

contract Notary{
    
    event NotaryAdded(uint id, address _owner, string _ipfsHash, uint _timeStamp);
    
    uint filesCount;
    mapping(uint => NotaryEntry) public files;
    mapping(address => uint[]) public personFiles;
    
    struct NotaryEntry{
        uint id;
        string description;
        uint timestamp;
        string hash;
        address setBy;
        bool isSet;
    }
    
    function addNotaryEntry( string memory _hash, string memory _desc) public {
        
        uint _id = filesCount += 1;
        
        NotaryEntry storage notary = files[_id];
        notary.id = _id;
        notary.description = _desc;
        notary.timestamp = now;
        notary.hash = _hash;
        notary.setBy = msg.sender;
        notary.isSet = true;
        personFiles[msg.sender].push(filesCount);
        emit NotaryAdded(notary.id,notary.setBy, notary.hash, notary.timestamp);
    }
    
    function viewNotaryEntry(uint id) public view returns(uint _id, string memory _desc, string memory _hash, uint _timeStamp,address _owner){
        
        NotaryEntry memory notary = files[id];
        _desc = notary.description;
        _timeStamp = notary.timestamp;
        _hash = notary.hash;
        _id = notary.id;
        _owner = notary.setBy;
    }
    
    function getAPersonFiles(address _owner) public view returns(uint[] memory){
        uint[] storage _files = personFiles[_owner];
        return _files;
    }
    
    function getFilesCount() public view returns(uint){
        return filesCount;
    }
    
    
}