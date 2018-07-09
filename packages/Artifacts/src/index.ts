import {join,basename} from "path";
import {readdirSync} from "fs";
function getArtifacts(){
    let Artifacts = {}
        readdirSync(join(__dirname,'../../','contracts')).forEach(function (file) {
        /* If its the current file ignore it */
        if (!file.endsWith('.json')) return;

        /* Store module with its name (from filename) */
        Artifacts[basename(file, '.json')] = require(join(__dirname,'../../contracts/', file));
    });
    return Artifacts

}

export const Artifacts = getArtifacts();
