var fs = require('fs');
var _ = require('lodash');

function parseLine(l, interview, interviews) {
    var line = l.trim();
    if (line.startsWith('---')) {
        //TODO, add previous interview info to interviews list
        if (!!interview.Client) interviews.push(interview);
        return {};
    }

    var isHeader = false;

    ['Client', 'Candidate', 'Date', 'Type'].forEach(function(k) {
        if (line.startsWith(k)) {
            interview[k] = line.split(':')[1].trim();
        }
    });

    if (!isHeader) {
        var matchRes = /^\d+\.\s*(.*)/.exec(line.trim());
        if (!!matchRes) {
            if (!interview.questions) interview.questions = [];
            interview.questions.push(matchRes[1]);
        }
    }
    return interview;
}

function parseFile(file) {
    var interviews = [];
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function(err, cnt) {
            console.log(err, cnt.length);
            if (err) {
                reject(err);
                return;
            }
            var lines = cnt.split('\n');
            var interview = {};
            lines.forEach(function(l) {
                interview = parseLine(l, interview, interviews)
            });
            if (!!interview.Client) interviews.push(interview);
            resolve(interviews);

        });
    });
}

function parseDir(dir) {
    var promises = [];

    return new Promise(function(resolve, reject) {
        fs.readdir(dir, function(err, files) {
            console.log('read dir', err, files.length);
            if (err) return;
            var promises = _.map(files, function(file) {
                var filePath = dir + '/' + file;
                var fsStat = fs.statSync(filePath);
                if (fsStat.isDirectory()) return parseDir(filePath);
                else if (fsStat.isFile() && file.endsWith('.txt'))
                    return parseFile(filePath);
                else console.log('ignore', filePath);
            });
            Promise.all(promises).then(function(interviewses) {
                resolve(_.reduce(interviewses, function(interviews, item) {
                    return interviews.concat(item)
                }, []));
            });
            console.log('read dir finish', dir);
        });
    })
}

module.exports = {
    parseFile: parseFile,
    parseDir: parseDir
}
