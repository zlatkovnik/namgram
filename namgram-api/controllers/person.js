const Person = require('../models/person');
const Image = require('../models/image');
const controller = require('../controllers/person');
let { creds } = require("./../config/credentials");
let neo4j = require('neo4j-driver');
const _ = require('lodash');
let driver = neo4j.driver("bolt://0.0.0.0:7687", neo4j.auth.basic(creds.neo4jusername, creds.neo4jpw));
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);

var storage = require("@azure/storage-blob")
const accountname = "namgram";
const key = "b9/PjmImjnORF1berLyRe3OYyAO0dDGcTbqIYm5AkCm8tqYukKm/umiUPWLJujc2n+zPFwKbKKNFZAZm8kqWhA==";
const cerds = new storage.StorageSharedKeyCredential(accountname, key);
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    newPipeline
} = require('@azure/storage-blob');
const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY);
const pipeline = newPipeline(sharedKeyCredential);
const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    pipeline
);
const containerName = 'namgram1609522522970';
const clientBlob = blobServiceClient.getContainerClient(containerName)

function _manyPeople(neo4jResult) {
    return neo4jResult.records.map(r => new Person(r.get('person')))
}
function _manyimage(neo4jResult) {
    return neo4jResult.records.map(r => new Image(r.get('image')))
}

exports.getAll = async (req, res) => {
    try {
        let session = driver.session();
        const persons = await session.run('MATCH (person:Person) RETURN person', {
        });
        session.close();
        const Data = _manyPeople(persons)
        res.status(200)
            .json({ message: "Prikupljeno", Data })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.get = async (req, res) => {
    try {
        let session = driver.session();
        const person = await session.run('MATCH (n:Person {id: $id}) RETURN n', {
            id: req.params.id
        });
        const image = await session.run('MATCH (n:Person {id: $id})-[r:created]->(image:Image {person:$id}) RETURN image', {
            id: req.params.id
        })
        const pic = _manyimage(image)
        const Data = person.records[0].get('n').properties;
        if (image.records[0]) {
            const blobName = pic[0].blobName
            const blobClient = clientBlob.getBlobClient(blobName);
            const blobSAS = storage.generateBlobSASQueryParameters({
                containerName,
                blobName: blobName,
                permissions: storage.BlobSASPermissions.parse("racwd"),
                startsOn: new Date(),
                expiresOn: new Date(new Date().valueOf() + 86400)
            },
                cerds
            ).toString();

            const sasUrl = blobClient.url + "?" + blobSAS;
            Data.profilePic = sasUrl
        }
        else
            Data.profilePic = "false"

        session.close();
        res.status(200)
            .json({ message: "Prikupljeno", Data })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.getByEmail = async (req, res) => {
    try {
        let session = driver.session();
        const person = await session.run('MATCH (n:Person {email: $email}) RETURN n', {
            email: req.params.email
        })
        session.close();
        const Data = person.records[0].get('n').properties
        res.status(200)
            .json({ message: "Prikupljeno", Data })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.getByUsername = async (req, res) => {
    try {
        let session = driver.session();
        const person = await session.run('MATCH (n:Person {username: $username}) RETURN n', {
            username: req.params.username
        })
        session.close();
        const Data = person.records[0].get('n').properties
        res.status(200)
            .json({ message: "Prikupljeno", Data })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.getFollowing = async (req, res) => {
    try {
        let session = driver.session();
        const persons = await session.run('MATCH (n:Person {username: $username})-[:follows]->(person) RETURN person', {
            username: req.params.username
        })
        session.close();
        const Data = _manyPeople(persons)
        res.status(200)
            .json({ message: "Prikupljeno", Data })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.getFollowers = async (req, res) => {
    try {
        let session = driver.session();
        const persons = await session.run('MATCH (n:Person {username: $username})<-[:follows]-(person) RETURN person', {
            username: req.params.username
        })
        session.close();
        const Data = _manyPeople(persons)
        res.status(200)
            .json({ message: "Prikupljeno", Data })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.follow = async (req, res) => {
    try {
        let session = driver.session();
        const rel = await session.run('match (a:Person {username:$username1}),(b:Person {username:$username2}) merge (a)-[r:follows]->(b) return r ', {
            username1: req.body.username1,
            username2: req.body.username2
        })
        session.close();
        res.status(200)
            .json({ message: "Follow postavljen", rel })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.unfollow = async (req, res) => {
    try {
        let session = driver.session();
        const rel = await session.run('match (a:Person {username:$username1})-[r:follows]->(b:Person {username:$username2}) delete r ', {
            username1: req.body.username1,
            username2: req.body.username2
        })
        session.close();
        res.status(200)
            .json({ message: "Follow izbrisan", rel })
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
};

exports.deletePerson = async (req, res) => {
    let session = driver.session();
    try {
        user = await session.run('MATCH (n:Person {username: $id}) DELETE n', {
            id: req.body.username
        });
        res.status(200)
            .json({ message: "Obrisan", user });
    }
    catch (err) {
        res.json({ success: false });
        console.log(err);
    }
}