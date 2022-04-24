const { default: mongoose } = require("mongoose");
const { ApiPromise, WsProvider } = require('@polkadot/api');

class Setup {
    constructor(config) {
        this.config = config;
    }

    async getPolkadotAPI() {
        console.log(`Connecting to ${this.config.wsProviderUrl}`);
    
        const provider = new WsProvider(this.config.wsProviderUrl);
        const api = await ApiPromise.create({ provider });
        //await api.isReady;
        console.log("Connected to Node");
        return api;
    }

    async getDB() {
        const con = await mongoose.connect(this.config.mongoDBConstring);
        mongoose.connection
            .once("open", () => console.log("Connected to Database"))
            .on("error", error => {
                console.log("Couldn't connect to MongoDb Database",error);
            });
        return con;
      }
}


module.exports = Setup;

