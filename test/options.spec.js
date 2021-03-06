﻿// Copyright 2014 SAP AG.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http: //www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
// either express or implied. See the License for the specific
// language governing permissions and limitations under the License.

"use strict";

const setup = require("./setup");
const client = setup.client;

beforeEach(function(done) {
    client.reopen(function(err) {
        done(err);
    });
});

afterEach(function(done) {
    client.close(function() {
        done();
    });
});

afterAll(function(done) {
    delete setup.client;
    delete setup.rfcClient;
    delete setup.rfcPool;
    done();
});

it("options: pass when some parameters skipped", function(done) {
    //this.timeout(10000);
    let notRequested = [
        "ET_COMPONENTS",
        "ET_HDR_HIERARCHY",
        "ET_MPACKAGES",
        "ET_OPERATIONS",
        "ET_OPR_HIERARCHY",
        "ET_PRTS",
        "ET_RELATIONS"
    ];
    client.connect(function(err) {
        expect(err).toBeUndefined();
        client.invoke(
            "EAM_TASKLIST_GET_DETAIL",
            {
                IV_PLNTY: "A",
                IV_PLNNR: "00100000"
            },
            function(err, res) {
                expect(err).toBeUndefined();
                expect(res).toBeDefined();
                expect(res).toHaveProperty("ET_RETURN");
                expect(res.ET_RETURN.length).toBe(0);
                done();
            },
            { notRequested: notRequested }
        );
    });
});

it("options: error when all requested", function(done) {
    client.connect(function(err) {
        expect(err).toBeUndefined();
        client.invoke(
            "EAM_TASKLIST_GET_DETAIL",
            {
                IV_PLNTY: "A",
                IV_PLNNR: "00100000"
            },
            function(err, res) {
                // ET_RETURN error if all params requested
                expect(err).toBeUndefined();
                expect(res).toBeDefined();
                expect(res).toHaveProperty("ET_RETURN");
                expect(res.ET_RETURN.length).toBe(1);
                expect(res.ET_RETURN[0]).toEqual(
                    expect.objectContaining({
                        TYPE: "E",
                        ID: "DIWP1",
                        NUMBER: "212",
                        MESSAGE: "Task list A 00100000  is not hierarchical",
                        LOG_NO: "",
                        LOG_MSG_NO: "000000",
                        MESSAGE_V1: "A",
                        MESSAGE_V2: "00100000",
                        MESSAGE_V3: "",
                        MESSAGE_V4: "",
                        PARAMETER: "HIERARCHY",
                        ROW: 0,
                        FIELD: ""
                    })
                );
                done();
            }
        );
    });
});
