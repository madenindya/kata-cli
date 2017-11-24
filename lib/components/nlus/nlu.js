"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const merapi_1 = require("merapi");
const colors = require("colors");
const inquirer = require("inquirer");
const Table = require("cli-table");
const fs = require("fs");
const template = {
    default: {
        name: "kata",
        lang: "id",
        entities: {
            LOCATION: {
                type: "phrase",
                profile: "location"
            },
            PERSON: {
                type: "phrase",
                profile: "name"
            }
        }
    },
    email: {
        name: "email",
        lang: "id",
        entities: {
            email: {
                type: "phrase",
                profile: "email"
            }
        }
    },
    locationlabel: {
        name: "location_kata",
        lang: "id",
        entities: {
            location: {
                type: "phrase",
                profile: "location",
                labels: [
                    "common",
                    "places",
                    "city",
                    "street",
                    "country",
                    "airport"
                ],
                resolver: "location"
            }
        }
    },
    location: {
        name: "location",
        lang: "id",
        entities: {
            LOCATION: {
                type: "phrase",
                profile: "location"
            }
        }
    },
    name: {
        name: "person",
        lang: "id",
        entities: {
            PERSON: {
                type: "phrase",
                profile: "name"
            }
        }
    },
    sentiment: {
        name: "sentiment",
        lang: "id",
        entities: {
            sentiment: {
                type: "trait",
                profile: "sentiment",
                labels: [
                    "positive",
                    "negative",
                    "neutral"
                ]
            }
        }
    }
};
class Nlu extends merapi_1.Component {
    constructor(helper, api) {
        super();
        this.helper = helper;
        this.api = api;
    }
    init(name, sandbox) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sandboxName = sandbox || "default";
                let nluDesc = template[sandboxName];
                nluDesc.name = name;
                this.helper.dumpYaml("./nlu.yml", nluDesc);
                console.log(`Init NLU ${name}`);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    push() {
        return __awaiter(this, void 0, void 0, function* () {
            let nluDesc = this.helper.loadYaml("./nlu.yml");
            try {
                const nlu = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameGet, nluDesc.name);
                const entities = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesGet, nluDesc.name);
                if (nlu && nlu.data) {
                    let { lang, visibility } = nluDesc;
                    visibility = visibility || "private";
                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePut, nluDesc.name, { lang, visibility });
                    if (nluDesc.entities && entities.data) {
                        const localDiff = this.helper.difference(nluDesc.entities, entities.data);
                        if (localDiff) {
                            for (const key in localDiff) {
                                if (entities.data[key]) {
                                    // Update remote entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesEntityNamePut, nluDesc.name, key, Object.assign({}, nluDesc.entities[key], { name: key }));
                                }
                                else {
                                    // Create new entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesPost, nluDesc.name, Object.assign({}, nluDesc.entities[key], { name: key }));
                                }
                            }
                        }
                        const remoteDiff = this.helper.difference(entities.data, nluDesc.entities);
                        if (remoteDiff) {
                            for (const key in remoteDiff) {
                                if (!nluDesc.entities[key]) {
                                    // delete remote entity
                                    yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesEntityNameDelete, nluDesc.name, key);
                                }
                            }
                        }
                    }
                    if (!nluDesc.entities && entities.data) {
                        for (const key in entities.data) {
                            // delete remote entity
                            yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesEntityNameDelete, nluDesc.name, key);
                        }
                    }
                    if (nluDesc.entities && !entities.data) {
                        for (const key in nluDesc.entities) {
                            // create new entity
                            yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameEntitiesPost, nluDesc.name, Object.assign({}, nluDesc.entities[key], { name: key }));
                        }
                    }
                }
                console.log(`NLU ${nluDesc.name} Updated !`);
            }
            catch (error) {
                let errorMessage = this.helper.wrapError(error);
                if (errorMessage === "You're not authorized to manage this Nlu.") {
                    try {
                        yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusPost, nluDesc);
                        console.log(`NLU ${nluDesc.name} Created !`);
                    }
                    catch (error) {
                        console.log(this.helper.wrapError(error));
                    }
                }
                else {
                    console.log(this.helper.wrapError(error));
                }
            }
        });
    }
    train(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let nluDesc = this.helper.loadYaml("./nlu.yml");
                let opts = {};
                if (options.file) {
                    console.log(`Training.. (input file: ${options.file})`);
                    opts = {
                        file: fs.createReadStream(options.file)
                    };
                }
                else if (options.sentence) {
                    console.log(`Training.. (input: ${options.sentence})`);
                    opts = {
                        sentence: options.sentence
                    };
                }
                const trainResult = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNameTrainPost, nluDesc.name, opts);
                console.log(`Success: ${trainResult.data.count} data trained !`);
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    predict(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let nluDesc = this.helper.loadYaml("./nlu.yml");
                let opts = {};
                if (options.file) {
                    console.log(`Predict.. (input file: ${options.file})`);
                    opts = {
                        file: fs.createReadStream(options.file)
                    };
                }
                else if (options.sentence) {
                    console.log(`Predict.. (input: ${options.sentence})`);
                    opts = {
                        sentence: options.sentence
                    };
                }
                const predicResult = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusNluNamePredictPost, nluDesc.name, opts);
                console.log(`Success, result : `);
                let i = 0;
                predicResult.response.body.result.forEach((x) => {
                    console.log(`${++i}. Input: ${x.input}`);
                    console.log(`   Result: ${JSON.stringify(x.output)}`);
                });
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    listProfiles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const profiles = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusProfilesGet);
                if (profiles && profiles.data) {
                    let table = new Table({
                        head: ['Type', 'Name', 'Desc'],
                        colWidths: [20, 20, 20]
                    });
                    profiles.data.forEach((profile) => {
                        table.push([profile.type, profile.name, profile.type]);
                    });
                    console.log(table.toString());
                }
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
    listNlus(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                page = page || 1;
                limit = limit || 10;
                const nlus = yield this.helper.toPromise(this.api.nluApi, this.api.nluApi.nlusGet, { page, limit });
                if (nlus && nlus.data) {
                    let table = new Table({
                        head: ['Name', 'Languange', 'Visibility'],
                        colWidths: [20, 20, 20]
                    });
                    nlus.data.items.forEach((nlus) => {
                        table.push([nlus.name, nlus.lang, nlus.visibility]);
                    });
                    console.log(table.toString());
                }
            }
            catch (error) {
                console.log(this.helper.wrapError(error));
            }
        });
    }
}
exports.default = Nlu;
//# sourceMappingURL=nlu.js.map