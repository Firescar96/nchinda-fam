
const fs = require('fs');

let doc1 = JSON.parse(fs.readFileSync('./unknown-1.json'));
let doc2 = JSON.parse(fs.readFileSync('./unknown-2.json'));
let doc3 = JSON.parse(fs.readFileSync('./unknown-3.json'));
let doc4 = JSON.parse(fs.readFileSync('./wondambong.json'));

const Agent = require('../src/models/Agent.js')
const mongoose = require('mongoose')

async function main() {
    const members = [];

    // let's do some DFS real quick
    const rawfamilyTreeData = [doc1, doc2, doc3, doc4]
    const queue = [];

    // give top level people a name and add them to the queue
    rawfamilyTreeData.forEach(familyTree => {
        Object.entries(familyTree).forEach(([name, info]) => {
            info.name = name;
            queue.push(info);
        })
    })

    // this flattens the family members json
    while(queue.length > 0) {
        // setup the data for a new db node
        const currentNode = queue.pop()
        currentNode._id = new mongoose.Types.ObjectId();
        const children = currentNode.children || {}
        currentNode.children = [];
        
        // create the db model
        const agent = new Agent(currentNode)
        
        // create children data and add them to the queue
        Object.entries(children).forEach(([name, child]) => {
            child.name = name
            child.parent = agent
            queue.push(child)
        })
        // if we have a parent update their data
        if(currentNode.parent) {
            currentNode.parent.children.push(agent._id);
            await currentNode.parent.save()
        }
        members.push(agent)
        await agent.save()
    }
    
    console.log('update complete')
}

main()

