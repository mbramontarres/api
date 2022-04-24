import  config  from '../config/config.js';

import  Setup  from './setup.js';

const setup = new Setup(config); 

//GetApi
const api = await  setup.getPolkadotAPI();

//GetMongodbconnection
const db = await setup.getDB();

console.log(api.genesisHash.toHex());






