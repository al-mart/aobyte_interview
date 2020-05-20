const express = require('express');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongo = require('mongodb');
const socket = require("socket.io");
const session = require("express-session");

const MongoDBStore = require('connect-mongodb-session')(session);


let bodyParser = require('body-parser');
let lastSession = 0;
const app = express();
const port = 5000;
const mongoUrl = "mongodb://localhost:27017/aobyte";
const store = new MongoDBStore({
    uri: mongoUrl,
    collection: 'sessions'
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET, PUT, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: 'no-secrets',
    saveUninitialized: false,
    resave: false,
    cookie: {maxAge: 60000},
    store: store
}));

let server = app.listen(port, () => {
    console.log(`App Listening on port ${port}`.blue)
});

let io = socket(server);

/*******************************/

io.sockets.on("connection", (connectedSocket) => {

    connectedSocket.on("broadcast", function (data) {
        connectedSocket.broadcast.emit('datachange', data);
    })
});


app.use((req, res, next) => {
    console.log(req.session.sessionId);
    if (!req.session.views) {
        req.session.views = lastSession++;
    }
    console.log(req.session);
    next();
});

/*******************************/

app.get("/tickets/:id", async (req, res) => {
    let id = +req.params.id;
    let isAssigned = (id === 1);
    let tickets = await retrieveMongoData(isAssigned);
    res.json(tickets);
});

getAllTicketsFromMongo = async () => {
    let firstArray = await retrieveMongoData(true);
    let secondArray = await retrieveMongoData(false);
    let data = {
        "data": [
            {
                "docs": firstArray
            },
            {
                "docs": secondArray
            }
        ]
    };
    return data;
};

async function retrieveMongoData(isAssigned) {
    const clientDb = await mongo.connect(mongoUrl).catch(err => {
        console.log(err);
    });
    try {
        let collection = clientDb.collection('tickets');
        let query = {"isAssigned": isAssigned};
        let tickets = await collection.find(query).toArray();
        return tickets;
    } catch (err) {
        console.log(err);
    }
}

app.post("/ticket", (req, res) => {
        let ticket = req.body.ticket;
        mongo.connect(mongoUrl, (err, db) => {
            if (!err) {
                let id = null;
                db.collection("id").findOne().then((result) => {
                    id = result["lastId"] + 1;
                    return Promise.resolve();
                }).then(() => {
                    return db.collection("id").findOneAndUpdate({}, {"lastId": id}).then((result) => {
                        return Promise.resolve();
                    });
                }).then(() => {
                    db.collection("tickets").insertOne({
                        "_id": id,
                        "ticket": ticket,
                        "isAssigned": false
                    }, (err, result) => {
                        if (!err) {
                            console.log(`Item With id (${id}) and name (${ticket}) is successfully inserted`.green);
                            db.close();
                            broadcast().then(() => {
                                res.send(`Item With id (${id}) and name (${ticket}) is successfully inserted`)
                            });
                        }
                    });
                });
            }
        });
    }
);
broadcast = async () => {
    let data = await getAllTicketsFromMongo();
    io.sockets.emit('datachange', data);
};

app.put("/ticket/:id", async (req, res) => {
    console.log("Put req".red);
    let id = +req.params.id;
    let userId = req.sessionId;
    console.log(userId);
    updateTicket(id, userId).then((result) => {
        broadcast().then(() => {
            res.sendStatus(200);
        });
    });
});

updateTicket = async (id, userId) => {
    const clientDb = await mongo.connect(mongoUrl).catch(err => {
        console.log(err);
    });
    try {
        let collection = clientDb.collection('tickets');
        let ticket = await collection.findOne({"_id": id});
        ticket["isAssigned"] = !ticket["isAssigned"];
        ticket["sessionId"] = userId;
        return collection.findOneAndUpdate({"_id": id}, ticket).then((result) => {
            return Promise.resolve();
        });
    } catch (err) {
        console.log(err);
    }
};

app.delete("/ticket/:id", (req, res) => {
    console.log("Delete Req".red);
    let id = +req.params.id;
    deleteTicket(id).then((result, error) => {
        if (error) {
            res.sendStatus(500);
        }
        broadcast().then(() => {
            res.sendStatus(200);
        });
    });
});
deleteTicket = async function (id) {
    const clientDb = await mongo.connect(mongoUrl).catch(err => {
        console.log(err);
    });
    try {
        let collection = clientDb.collection('tickets');
        return collection.deleteOne({"_id": id}).then((result) => {
            return Promise.resolve();
        });
    } catch (err) {
        console.log(err);
    }
};
