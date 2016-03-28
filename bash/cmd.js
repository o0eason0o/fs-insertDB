var parse = require('./parse');
var db = require('./db');

parse.parseDir(__dirname + '/data')
.then(db.saveInterviews)
.then(function(interviews){
    return db.dbConn.then(function(db){
        return db.close();
    });
})
.catch(console.log)

//parse.parseFile(__dirname+'/data/Barclays.txt')
//    .then(function(interviews){
//        console.log(interviews.length, interviews[0].questions.length);
//   })
