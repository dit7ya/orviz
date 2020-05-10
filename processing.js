const orgRoamDBLocation = require('./config.json').orgroam_dir + 'org-roam.db';
const orvizDirectory = require('./config.json').orviz_dir;
// console.log(orgRoamDBLocation);

// const db = require('better-sqlite3')('/home/halum/org/org-roam.db');
const db = require('better-sqlite3')(orgRoamDBLocation);


const promisify = require('util').promisify;
const pdc = promisify(require('pdc'));

let titleEntries = db.prepare('SELECT * from titles').all();
let linkEntries = db.prepare('SELECT * from links').all();

let nodes = [];

for (let entry in titleEntries) {
    let file = titleEntries[entry]['file'];
    let titles = titleEntries[entry]['titles'];
    let isJournal = false;
//     console.log(typeof file)
    if (file.includes("journal")) {
        isJournal = true;
    }
    // use the file name if title is null
    let firstTitle;
    // use the first title (not the ROAM_ALIASes) as the label,
    // TODO put the aliases as extra data as tooltip
    if (titles) {
        firstTitle = titles.replace(/^\("/g, '').replace(/".*/g, '');
    }
    else {
        firstTitle = file.replace(/.*\//g, '').replace(/"/g, '');
    };
    nodes.push({id: file, label: firstTitle, isJournal: isJournal});
//     console.log(firstTitle)
}

const getByKey = (arr,key) => (arr.find(x => Object.keys(x)[0] === key) || {})[key];

let edges = [];

for (let link in linkEntries) {
    let properties = linkEntries[link].properties;
    let from = linkEntries[link].from;
    let to = linkEntries[link].to;

    let currentContent = properties.replace(/(.*?)"/, '');
    currentContent = currentContent.replace(/"(.*)/, '');


    async function f() {
    try {
      const result = await pdc(currentContent, 'org', 'html'); //Buffer
      currentContent = result.toString(); //String
    } catch (error) {
        console.error(error, currentContent);
    }
    }
    f();

    let fromto = from + to;
    let tofrom = to + from;
    if (getByKey(edges,fromto))
        {
            getByKey(edges,fromto)['content'] += String(`\n\n ${currentContent}`);
        }
    else if (getByKey(edges, tofrom)) {
        getByKey(edges,tofrom)['content'] += String(`\n\n ${currentContent}`);

    }
    else {
//         we need [key] syntax for settings keys with variables
        edges.push({[fromto]: {source:from, target: to, content: String(currentContent)}});
    };
}

// convert the edges object to what G6 demands

let edgesProcessed = [];

for (const key of Object.keys(edges)) {
    const val = edges[key];
    const firstKey = Object.keys(edges[key])[0];
    edgesProcessed.push(val[firstKey]);
}

dataObj = {nodes:nodes, edges:edgesProcessed};

const fs = require("fs");

fs.writeFile(orvizDirectory + "processed.json", JSON.stringify(dataObj),
             err => {if (err) throw err;});
