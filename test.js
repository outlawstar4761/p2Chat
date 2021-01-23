const p2Chat = require('./src/p2Chat');


(async ()=>{
  await p2Chat.connect();
  p2Chat.testSend('Hello world!');
})();
