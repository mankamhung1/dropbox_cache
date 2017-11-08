var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var path = require('path');
var fileUpload = require('express-fileupload');
var app = express();

var cache = [];

/*
var promise = new Promise((resolve, reject) => {
    resolve();
});
*/

function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("File saved successfully!");
        });
    });
}

function downloadFS(res, req, filePath) {
  var fileStream = fs.createReadStream(filePath);
  fileStream.on('data', function (data) {
//      res.setHeader('Content-type', "application/force-download", "Content-disposition", "attachment; filename="+ res.query.file);
      res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename='+req.query.downloadFilename});
      res.write(data);
      var cacheData = [data, filePath];
      cache.push(cacheData);
      console.log("Downloaded From Local !")
//      console.log(cacheData);
//      console.log(cache);
  });
  fileStream.on('end', function() {
      res.end();
  });
}

function downloadCache(i, res, req, filePath) {
  var fileStream = fs.createReadStream(filePath);
  fileStream.on('data', function (data) {
      res.writeHead(200, {'Content-Type': 'application/force-download','Content-disposition':'attachment; filename='+req.query.downloadFilename});
      res.write(cache[i][0]);
      console.log("Downloaded From Cache !")
  });
  fileStream.on('end', function() {
      res.end();
  });
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('js'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

//      res.download(filePath);
app.get('/download', function(req, res) {
  var filePath = __dirname + '/storage/' + req.query.downloadFilename;
//  var file = req.query.file;
  if (cache.length == 0) {
        downloadFS(res, req, filePath);
  }
  else {
      var cacheExisted = false;
      var indexOfCache;
      for (i=0; i< cache.length; i++) {
            if (cache[i][1] == filePath) {
              cacheExisted = true;
              indexOfCache = i;
            }
      }

      if (cacheExisted == true) {
        downloadCache(indexOfCache, res, req, filePath);
      }
      else {
        downloadFS(es, req, filePath);
      }
  }
});

app.post('/storage', function(req, res) {
  var uploadFile = req.files.file;
  var fileName = req.files.file.name;
  writeFile(__dirname + '/storage/' + fileName, req.files.file.data);

  /* // .mv method:
  var uploadFile = req.files.file;
  var fileName = req.files.file.name;
  uploadFile.mv(__dirname + '/storage/' + fileName , function(err) {
       if(err){
         console.log(err);
       }
       else{
         console.log("uploaded");
       }
  });
  */
});

app.listen(8080);
