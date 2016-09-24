var fs = require('fs');
var path = require('path');
var validator = require('html-validator');
var klaw = require('klaw');
var DecompressZip = require('decompress-zip');

//var out = fs.readdirSync("../6041/");

//console.log("data: ", out);
//
var options = {
    url: 'https://html5.validator.nu',
    format: 'text'
}

var students = [];

var inputDirectory = "../" + process.argv[2] + "/";
//console.log("inputDirectory: ", "../" + inputDirectory + "/");


fs.readdir(inputDirectory, function(err, files) {
    //console.log("files: ", files);

    files.forEach(function(file) {
        if (file.includes(".zip")) {
            //unZipFile(inputDirectory + file);
            //
            //
            //
            var filePath = inputDirectory + file;

            var cutAt = getStrPosition(filePath, "_", 2);
            var outputPath = filePath.substring(0, cutAt);
            //console.log("output: ", outputPath);
            var unzipper = new DecompressZip(filePath);

            unzipper.on('error', function(err) {
                console.log('Caught an error: ', err);
            });

            unzipper.on('extract', function(log) {
                console.log('Finished extracting: ' + filePath);

                var items = [] // files, directories, symlinks, etc
                klaw(outputPath)
                    .on('data', function(item) {
                        if (!item.path.includes('__MACOSX') && item.path.endsWith('.html')) {
                            items.push();

                            fs.readFile(item.path, 'utf8', function(err, html) {
                                if (err) {
                                    throw err;
                                }

                                options.data = html;

                                validator(options, function(error, data) {
                                    if (error) {
                                        throw error
                                    }

                                    //var isError = false;
                                    //console.log("\n\nSOURCE: ", outputPath);

                                    // mozno este pridat aj Warning
                                    //console.log("Data: ", data.includes('Error'));

                                    // if (data.includes('Error')) {
                                    //     isError = true;
                                    // }

                                    var idInArray = isExistingStudent(outputPath);
                                    if (idInArray === -1) {
                                        students.push({
                                            studentId: outputPath,
                                            html: [{
                                                file: item.path,
                                                error: data
                                            }],
                                            css: {}
                                        });
                                    } else {
                                        students[idInArray].html.push({ file: item.path, error: data });
                                    }



                                    // if (data.indexOf("The document validates according to the specified schema(s).") !== -1) {
                                    //   console.log(studentID + ": OK!\n");
                                    // } else {
                                    //   console.log(studentID + ": PROBLEM!\n");

                                    // }
                                    //
                                });



                            });
                        }


                    })
                    .on('end', function() {
                        //console.log(outputPath);
                        //console.dir(items) // => [ ... array of files]

                        // items.forEach(function(sourceFile) {

                        // });
                    })
            });



            // unzipper.on('progress', function(fileIndex, fileCount) {
            //     console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
            // });

            unzipper.extract({
                path: outputPath,
                filter: function(inputFile) {
                    return inputFile.type !== "SymbolicLink";
                }
            });
        }
    });

});

// files.forEach(function(name) {
//     if (name.includes(".zip")) {
//         //console.log("filee: ", name);
//         unZipFile(inputDirectory + name);
//     }
// });
// //console.log("robim zadania");
// setTimeout(function() {
//     walk(inputDirectory);
// }, 2000);



setTimeout(function() {
    for (var i = 0; i < students.length; i++) {
        var hasError = false;
        console.log("\nStudent: ", students[i].studentId);
        for (var j = 0; j < students[i].html.length; j++) {
            if (students[i].html[j].error.includes("There were errors.")) {
                //console.log("error: ", students[i].html[j].error);
                // mozno kontrolovat aj warningy
                //console.log("Error in file: ", students[i].html[j].file);
                hasError = true;
                break;
            }
        }
        if (hasError) {
            console.log("PROBLEM!");
        } else {
            console.log("OK.");
        }
    }
}, 6000);



// function validateTimeout(sourceFile) {
//     setTimeout(function() {
//         console.log("inside src: ");
//         validateHtml(sourceFile);
//     }, 5000);
// }



// function walk(currentDirPath, callback) {
//     var files = fs.readdirSync(currentDirPath);

//     files.forEach(function(name) {
//         var filePath = path.join(currentDirPath, name);

//         var firstIndex = getStrPosition(filePath, '/', 2);
//         var secondIndex = getStrPosition(filePath, '/', 3);


//         var id = filePath.substring(firstIndex + 1, secondIndex);

//         var idInArray = isExistingStudent(id);
//         if (idInArray === -1) {
//             students.push({
//                 studentId: id,
//                 htmlFiles: [],
//                 cssFiles: []
//             });
//         }

//         //console.log("studentID: ", studentID);

//         var stat = fs.statSync(filePath);
//         if (stat.isFile() && filePath.includes('html')) {
//             if (idInArray !== -1) {
//                 students[idInArray].htmlFiles.push(filePath);
//             }

//             //htmlFiles.push(filePath);
//         } else if (stat.isFile() && filePath.includes('css')) {
//             //cssFiles.push(filePath);
//             if (idInArray !== -1) {
//                 students[idInArray].cssFiles.push(filePath);
//             }
//         } else if (stat.isDirectory()) {
//             walk(filePath, callback);
//         }
//     });
// }
//

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

// function validateHtml(sourceFile) {
//     fs.readFile(sourceFile, 'utf8', function(err, html) {
//         if (err) {
//             throw err;
//         }

//         options.data = html;

//         console.log("validator srcFile: ", sourceFile);

//         validator(options, function(error, data) {
//             if (error) {
//                 throw error
//             }

//             console.log("\n\nSOURCE: ", sourceFile);
//             console.log("Data: ", data);

//             // if (data.indexOf("The document validates according to the specified schema(s).") !== -1) {
//             //   console.log(studentID + ": OK!\n");
//             // } else {
//             //   console.log(studentID + ": PROBLEM!\n");

//             // }
//             //

//         });

//     });

// }


function getStrPosition(str, m, i) {
    return str.split(m, i).join(m).length;
}

// function getProjectsFromDir() {
//     var files = fs.readdirSync(inputDirectory);
//     files.forEach(function(name) {
//         if (name.includes(".zip")) {
//             //console.log("filee: ", name);
//             unZipFile(inputDirectory + name);
//         }
//     });
//     //console.log("robim zadania");
//     setTimeout(function() {
//         walk(inputDirectory);
//     }, 2000);
// }

// function unZipFile(filename) {
//     var underscore = getStrPosition(filename, "_", 2);
//     var outputPath = filename.substring(0, underscore);
//     var unzipper = new DecompressZip(filename);

//     unzipper.on('error', function(err) {
//         console.log('Caught an error: ', err);
//     });

//     unzipper.on('extract', function(log) {
//         console.log('Finished extracting: ' + filename);
//     });

//     unzipper.on('progress', function(fileIndex, fileCount) {
//         console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
//     });

//     unzipper.extract({
//         path: outputPath,
//         filter: function(file) {
//             return file.type !== "SymbolicLink";
//         }
//     });
// }
