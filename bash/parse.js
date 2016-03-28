var fs = require('fs');
var db = require('./db');

var interviews = [];

fs.readFile(__dirname + '/data/Barclays.txt', 'utf8', function(err, cnt) {
    console.log(err, cnt.length);
    var lines = cnt.split('\n');
    var interview = {};
    lines.forEach(function(l) {
        var line = l.trim();
        if (line.startsWith('---')) {
            //TODO, add previous interview info to interviews list
            if (!!interview.Client) interviews.push(interview);
            interview = {};
            return;
        }

        var isHeader = false;

        ['Client', 'Candidate', 'Data', 'Type'].forEach(function(k) {
            if (line.startsWith(k)) {
                interview[k] = line.split(':')[1].trim();
            }
        });

        if (!isHeader) {
            var matchRes = /^\d+\.\s*(.*)/.exec(line.trim());
            if (!matchRes) return;
            if (!interview.questions) interview.questions = [];
            interview.questions.push(matchRes[1]);
        }
    });
    if (!!interview.Client) interviews.push(interview);

    db.saveInterviews(interviews)
        .then(function(info){
            console.log('after save', info);
            return db.dbConn.then(function(db){return db.close();});
        })
        .catch(console.log);
})
