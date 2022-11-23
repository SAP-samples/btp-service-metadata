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
