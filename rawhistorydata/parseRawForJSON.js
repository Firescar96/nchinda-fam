
const fs = require('fs');

let doc1 = JSON.parse(fs.readFileSync('./unknown-1.json'));
let doc2 = JSON.parse(fs.readFileSync('./unknown-2.json'));
let doc3 = JSON.parse(fs.readFileSync('./unknown-3.json'));
let doc4 = JSON.parse(fs.readFileSync('./wondambong.json'));

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
        currentNode.id = new mongoose.Types.ObjectId().toHexString();
        const children = currentNode.children || {}
        currentNode.children = [];
        
        // create the db model
        const agent = {
            id: (new mongoose.Types.ObjectId()).toHexString(),
            parent: currentNode.parent? currentNode.parent.id: null,
            name: currentNode.name,
            dead: currentNode.dead,
            occupation: currentNode.occupation,
            depth: currentNode.parent? currentNode.parent.depth+1:0,
        }
        
        // create children data and add them to the queue
        Object.entries(children).forEach(([name, child]) => {
            child.name = name
            child.parent = agent
            queue.push(child)
        })
        // if we have a parent update their data
        members.push(agent)
    }
    
    console.log('update complete', members)
    fs.writeFileSync('./database.json', JSON.stringify(members,null, 2));
}

main()

