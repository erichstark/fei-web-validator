var fs = require('fs');
var path = require('path');
var validator = require('html-validator');
var DecompressZip = require('decompress-zip');

//var out = fs.readdirSync("../6041/");

//console.log("data: ", out);
//
var options = {
    url: 'https://validator.nu',
    format: 'text'
}

var students = [];

getFilesInDir();

setTimeout(function() {
    for (var i = 0; i < students.length; i++) {
        console.log("\nstudent: ", students[i].studentId);
        for (var j = 0; j < students[i].htmlFiles.length; j++) {
            console.log("file: ", students[i].htmlFiles[j]);
            doSetTimeout(i, j);
        }
    }

}, 4000);

function doSetTimeout(i, j) {
    setTimeout(function() {
        validateHtml(students[i].htmlFiles[j]);
    }, 2000);
}



function walk(currentDirPath, callback) {
    var files = fs.readdirSync(currentDirPath);

    files.forEach(function(name) {
        var filePath = path.join(currentDirPath, name);

        var firstIndex = getStrPosition(filePath, '/', 2);
        var secondIndex = getStrPosition(filePath, '/', 3);


        var id = filePath.substring(firstIndex + 1, secondIndex);

        var idInArray = isExistingStudent(id);
        if (idInArray === -1) {
            students.push({
                studentId: id,
                htmlFiles: [],
                cssFiles: []
            });
        }

        //console.log("studentID: ", studentID);

        var stat = fs.statSync(filePath);
        if (stat.isFile() && filePath.includes('html')) {
            if (idInArray !== -1) {
                students[idInArray].htmlFiles.push(filePath);
            }

            //htmlFiles.push(filePath);
        } else if (stat.isFile() && filePath.includes('css')) {
            //cssFiles.push(filePath);
            if (idInArray !== -1) {
                students[idInArray].cssFiles.push(filePath);
            }
        } else if (stat.isDirectory()) {
            walk(filePath, callback);
        }
    });
}

function isExistingStudent(id) {
    var exists = -1;
    for (var i = 0; i < students.length; i++) {
        if (students[i].studentId === id) {
            exists = i;
            break;
        }
    }
    return exists;
}


function validateHtml(sourceFile) {
    fs.readFile(sourceFile, 'utf8', function(err, html) {
        if (err) {
            throw err;
        }

        options.data = html;

        //console.log("validator srcFile: ", sourceFile);

        validator(options, function(error, data) {
            if (error) {
                throw error
            }

            console.log("Data: ", data);

            // if (data.indexOf("The document validates according to the specified schema(s).") !== -1) {
            //   console.log(studentID + ": OK!\n");
            // } else {
            //   console.log(studentID + ": PROBLEM!\n");

            // }

        })

    });

}

function getStrPosition(str, m, i) {
    return str.split(m, i).join(m).length;
}

function getFilesInDir() {
    var files = fs.readdirSync("../moodle/");
    files.forEach(function(name) {
        if (name.includes(".zip")) {
            //console.log("filee: ", name);
            unZipFile("../moodle/" + name);
        }
    });
    //console.log("robim zadania");
    setTimeout(function() {
        walk("../moodle/");
    }, 2000);
}

function unZipFile(filename) {
    var underscore = getStrPosition(filename, "_", 2);
    var outputPath = filename.substring(0, underscore);
    var unzipper = new DecompressZip(filename);

    unzipper.on('error', function(err) {
        console.log('Caught an error: ', err);
    });

    unzipper.on('extract', function(log) {
        console.log('Finished extracting');
    });

    unzipper.on('progress', function(fileIndex, fileCount) {
        console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
    });

    unzipper.extract({
        path: outputPath,
        filter: function(file) {
            return file.type !== "SymbolicLink";
        }
    });
}
