'use strict';
const fs = require('fs');

class Template {

    constructor() {
        this.templ_folder = './html/';
        this.node = 'main.html';
        this.expression = /\[\[\[\w*\]\]\]/gm;
        this.main = "";

    }
    getContent() {
        if (fs.lstatSync(this.templ_folder).isDirectory()) {
            if (this.fileExists(this.node)) {
                this.main = this.parseTemplate(this.node)
            }
        } else {
            throw new Error('Template folder could not be found: ' + this.templ_folder);
        }
        return this.main;
    }
    parseTemplate(file_path) {
        var tmp = fs.readFileSync(this.templ_folder + file_path).toString();
        var markups = tmp.match(this.expression);
        if (markups) {
            markups = this.cleanArray(markups);

            for (var index = 0; index < markups.length; index++) {
                var mrk = markups[index];
                var new_file = ((mrk.split(' ').join('')).split('[').join('')).split(']').join('') + '.html';
                if (this.fileExists(new_file)) {
                    tmp = tmp.split(mrk).join(this.parseTemplate(new_file));
                }
            }

        }
        return tmp;
    }
    fileExists(file_path) {
        if (fs.lstatSync(this.templ_folder + file_path).isFile()) {
            return true;
        } else {
            throw new Error('template file could not be found : ' + file_path);
        }
    }
    cleanArray(data) {
        var cleaned = [];
        data.forEach(function(el) {
            if (!cleaned.includes(el)) cleaned.push(el);
        });
        return cleaned;
    }
}

module.exports = Template;