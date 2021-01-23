const mod = (function(){
  const crypto = require('crypto');
  const Swarm = require('discovery-swarm');
  const defaults = require('dat-swarm-defaults');
  const getPort = require('get-port');
  const myId = crypto.randomBytes(32);
  const _peers = {};
  let _connSeq = 0;
  let _port = 0;
  const config = defaults({
    // peer-id
    id: myId,
  });
  const sw = Swarm(config);
  sw.on('connection',(conn,info)=>{
    const seq = _connSeq; //connection id
    const peerId = info.id.toString('hex');
    // Keep alive TCP connection with peer
    if (info.initiator) {
      try{
        conn.setKeepAlive(true, 600);
      }catch (exception) {
        console.error(exception);
      }
    }
    conn.on('data',(data)=>{
      //do something better with the sent data
      console.log('Received Message from peer ' + peerId + '----> ' + data.toString());
    });
    conn.on('close',()=>{
      if(_peers[peerId].seq === seq){
        delete _peers[peerId];
      }
    });
    if (!_peers[peerId]) {
      _peers[peerId] = {};
    }
    _peers[peerId].conn = conn;
    _peers[peerId].seq = seq;
    _connSeq++;
  });
  function _sendMessage(message){
    // Broadcast to peers
    for (let id in peers){
      peers[id].conn.write(message);
    }
  }
  async function _getPort(){
    _port = await getPort();
  }
  async function _connect(){
    await _getPort();
    sw.listen(_port);
    console.log('Your identity: ' + myId.toString('hex'));
    console.log('Listening to port: ' + _port);
    sw.join('default-channel');
  }
  return {
    connect:function(){
      return _connect();
    },
    testSend:function(message){
      setInterval(()=>{
        _sendMessage(message);
      },2000);
    }
  };

}());

module.exports = mod;
