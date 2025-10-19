const Audit=require(`../models/auditSchema`);

async function createRecord(userId, action, metadata={}){
    const audit= new Audit({user:userId, action, metadata, timestamp:new Date(),});
}

async function getUserLog(userId){
    return await Audit.find({user:userId}.sort({timestamp:-1}));
}

async function getRecentLog(limit=21){
    return await Audit.find().sort({timestamp:-1}).limit(limit);
}


module.exports={
    getRecentLog,
    getUserLog,
    createRecord
}