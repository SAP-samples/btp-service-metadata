/*
 * Simple helper function that will allow slurping of all
 * metadata files; useful when running in a Node.js REPL.
 * When loaded (with the REPL's .load function) all the 
 * metadata will be available in 'm'.
 */

const fs = require('fs')
const path = require('path')
const metadatadir = '../v0/developer/'

const slurp = (directory) => fs
   .readdirSync(directory)
   .filter(name => path.extname(name) === '.json')
   .map(name => require(path.join(directory, name)))

const m = slurp(metadatadir)
const i = require(path.join('../v0/','inventory.json'))

const groupby = (xs, key) => xs.reduce((a, x) => { (a[x[key]] = a[x[key]] || []).push(x); return a }, {})
const unique = (x, i, a) => a.indexOf(x) === i
