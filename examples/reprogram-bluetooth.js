var fs=require('fs');
var BTP=require('../bluetooth-programmer.js');
var BTDevices=[];
var currentID=false;

fs.readFile(
    'lastID', 
    function (err,data) {
        currentID=Number(data);
        if(!currentID)
            currentID=0;
        
        currentID++;
        BTP.find(foundDevices);
        //search all connected ports for Bluetooth devices and discover their baud rate.
        console.log('Searching for any BlueTooth devices connected via USB or serial');
    }
);


function foundDevices(devices){
    var list=Object.keys(devices);
    BTDevices=devices;
    console.log('Found BT Devices :\n####>',devices);
    
    if(!list[0])
        return;
    
    BTP.connect(devices[list[0]],connectedToBT);
}

function connectedToBT(){
    this.on(
        "data",
        gotData
    );
    this.on(
        "close",
        completeBTProgramming
    );
    this.on(
        "disconnect",
        completeBTProgramming
    );
    this.on(
        "error",
        function(err){
            console.log(err);
        }
    );
    
    console.log('setting Name');
    this.BTName('DNZ38400-'+currentID);
    fs.writeFile(
        'lastID',
        currentID,
        function (err) {
            currentID++;
        }
    );
    console.log('setting Pin');
    this.BTPin('1314');
    console.log('setting parity');
    this.BTParity('None');
    console.log('setting baud');
    this.BTBaud(38400);
    this.BTTest();//follow up with an extra Test to fetch the last message
    
    //Make sure BT doesn't hang when baud rate changed. And double check to make sure baud rate is correct.
    (
        function(BT){
            setTimeout(
                function(){
                    try{
                        BT.close();
                    }catch(err){
                        //do nothing because BT is already closed
                    }
                    console.log('Double checking modifications, searching for any BT Devices connected via USB or serial at the new baud rate.');
                    BTP.find(modifiedDevices,38400);
                },
                7500
            );
        }
    )(this);
}

function modifiedDevices(devices){
    console.log('\n\n########## Modification Complete #############\n\n','found',Object.keys(devices).length,'BT devices ###>',devices);
}

function completeBTProgramming(){
    console.log('finished board 0');
}
function gotData(data){
    console.log(data);
    if(data=="38400")
        this.close();
}

function completeBTProgramming(){
    console.log('finished board 0');
}