"use strict";
//@ts-check
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var api_1 = require("@polkadot/api");
var mongoose_1 = require("mongoose");
var block_dto_1 = require("../block/dto/block.dto");
var block_schema_1 = require("../block/block.schema");
var extrinsic_dto_1 = require("../extrinsic/extrinsic.dto");
var extrinsic_schema_1 = require("../extrinsic/extrinsic.schema");
var event_schema_1 = require("../event/event.schema");
var event_dto_1 = require("../event/event.dto");
var log_schema_1 = require("../log/log.schema");
var log_dto_1 = require("../log/log.dto");
function Run() {
    return __awaiter(this, void 0, void 0, function () {
        var wsProvider, api, db, chain;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wsProvider = new api_1.WsProvider('wss://rpc.polkadot.io');
                    return [4 /*yield*/, api_1.ApiPromise.create({ provider: wsProvider })];
                case 1:
                    api = _a.sent();
                    return [4 /*yield*/, mongoose_1["default"].connect(this.config.mongoDBConstring)];
                case 2:
                    db = _a.sent();
                    mongoose_1["default"].connection
                        .once("open", function () { return console.log("Connected to Database"); })
                        .on("error", function (error) {
                        console.log("Couldn't connect to MongoDb Database", error);
                    });
                    return [4 /*yield*/, api.rpc.system.chain()];
                case 3:
                    chain = _a.sent();
                    return [4 /*yield*/, api.rpc.chain.subscribeNewHeads(function (lastHeader) { return __awaiter(_this, void 0, void 0, function () {
                            var gaps;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("".concat(chain, ": last block #").concat(lastHeader.number, " has hash ").concat(lastHeader.hash));
                                        return [4 /*yield*/, db.model('blocks').aggregate([
                                                { $group: { _id: null, min: { $min: "$blockNum" }, max: { $max: "$lastHeader.number" } } },
                                                { $addFields: { rangeNums: { $range: ["$min", "$max"] } } },
                                                { $lookup: { from: "blocks", localField: "rangeIds", foreignField: "blockNum", as: "blocks" } },
                                                { $project: { _id: 0, missingIds: { $setDifference: ["$rangeIds", "$blocks.blockNum"] } } }
                                            ])];
                                    case 1:
                                        gaps = _a.sent();
                                        gaps.forEach(function (gap) { return __awaiter(_this, void 0, void 0, function () {
                                            var Blockmodel, Extmodel, Eventmodel, Logsmodel, extr, event, block, log, createdBlock, createdEvent, createdExtrinsic, createdLog, blockHash, CurrentBlock, extendedBlock, apiblock, extendedHeader, events, extrinsics, logs;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        Blockmodel = db.model('blocks', block_schema_1.BlockSchema);
                                                        Extmodel = db.model('extrinsics', extrinsic_schema_1.ExtrinsicSchema);
                                                        Eventmodel = db.model('events', event_schema_1.EventSchema);
                                                        Logsmodel = db.model('logs', log_schema_1.LogSchema);
                                                        extr = new extrinsic_dto_1.ExtrinsicType;
                                                        event = new event_dto_1.EventType;
                                                        block = new block_dto_1.BlockType;
                                                        log = new log_dto_1.LogType;
                                                        createdBlock = new Blockmodel(block);
                                                        createdEvent = new Eventmodel(event);
                                                        createdExtrinsic = new Extmodel(extr);
                                                        createdLog = new Logsmodel(log);
                                                        return [4 /*yield*/, api.rpc.chain.getBlockHash(gap)];
                                                    case 1:
                                                        blockHash = _a.sent();
                                                        return [4 /*yield*/, api.rpc.chain.getBlock(blockHash)];
                                                    case 2:
                                                        CurrentBlock = _a.sent();
                                                        return [4 /*yield*/, api.derive.chain.getBlock(blockHash)];
                                                    case 3:
                                                        extendedBlock = _a.sent();
                                                        return [4 /*yield*/, api.at(blockHash)];
                                                    case 4:
                                                        apiblock = _a.sent();
                                                        return [4 /*yield*/, api.derive.chain.getHeader(blockHash)];
                                                    case 5:
                                                        extendedHeader = _a.sent();
                                                        //const timestamp = gap !== 0? parseInt(block.extrinsics.find(({ method: { section, method } }) => section === 'timestamp' && method === 'set',).args[0].toString(),10,) : 0;
                                                        block.blockHash = blockHash.toHex();
                                                        block.blockNum = gap;
                                                        block.parentHash = CurrentBlock.block.header.parentHash.toHex();
                                                        block.extrinsicsRoot = CurrentBlock.block.header.extrinsicsRoot.toHex();
                                                        block.stateRoot = CurrentBlock.block.header.stateRoot.toHex();
                                                        block.blockAuthor = extendedBlock.author.toHex();
                                                        block.eventCount = extendedBlock.events.length;
                                                        block.extrinsicsCount = extendedBlock.block.extrinsics.length;
                                                        block.finalized = false;
                                                        events = extendedBlock.events;
                                                        extrinsics = extendedBlock.block.extrinsics;
                                                        logs = extendedBlock.block.header.digest.logs;
                                                        /*logs.forEach((l,index)=> {
                                                            log.blockNum = gap;
                                                            log.logIndex = index;
                                                            log.logType = l.type;
                                                            //log.engine = ----
                                                            log.data = l.
                                                        });*/
                                                        //Inserir logs
                                                        createdBlock.save();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
Run();
