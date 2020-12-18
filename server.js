var express = require("express")
var path = require("path")
var hbs = require('express-handlebars')
var app = express()
var formidable = require('formidable')
const { stringify } = require("querystring")
const port = process.env.PORT || 3000
var datatable = []
var next_id = 1

var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.redirect("/filemanager")
})
app.get("/upload", function (req, res) {
    res.render('upload.hbs')
})
app.post("/upload", function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/upload/'
    form.keepExtensions = true
    form.multiples = true
    form.parse(req, function (err, fields, files) {
        if (files.filetoupload.length == undefined) {
            var type_name = { id: next_id, name: files.filetoupload.name, path: files.filetoupload.path, size: files.filetoupload.size, type: files.filetoupload.type, savedate: Date.now(), img: undefined }
            next_id = next_id + 1
            switch (type_name.type) {
                case "image/png":
                    type_name.img = "imgpng"
                    break;
                case "image/jpeg":
                    type_name.img = "imgjpg"
                    break;
                case "application/x-msdownload":
                    type_name.img = "exe"
                    break;

                case "text/plain":
                    type_name.img = "text"
                    break;
                case "application/pdf":
                    type_name.img = "pdf"
                    break;

                default:
                    type_name.img = "unknown"
                    break;
            }
            datatable.push(type_name)
        } else { //wiele plików
            for (var i = 0; i < files.filetoupload.length; i++) {
                var type_name = { id: next_id, name: files.filetoupload[i].name, path: files.filetoupload[i].path, size: files.filetoupload[i].size, type: files.filetoupload[i].type, savedate: Date.now(), img: undefined }
                next_id = next_id + 1
                switch (type_name.type) {
                    case "image/jpeg":
                        type_name.img = "imgjpg"
                        break;
                    case "image/png":
                        type_name.img = "imgpng"
                        break;
                    case "text/plain":
                        type_name.img = "text"
                        break;
                    case "application/pdf":
                        type_name.img = "pdf"
                        break;
                    default:
                        type_name.img = "unknown"
                        break;
                }
                datatable.push(type_name)
            }
        }
    })
    res.redirect("/filemanager")
})
app.get("/filemanager", function (req, res) {
    context = { datatable }
    res.render("filemanager.hbs", context)
})
app.get("/clearFilemanagerAll", function (req, res) {
    datatable = []
    res.redirect("/filemanager")
})
app.get("/clearFilemanagerSingle/:id", function (req, res) {
    var deleteid = req.params.id
    var index = datatable.findIndex(object => object.id == deleteid)
    if (index != undefined) {
        datatable.splice(index, 1)
    }
    res.redirect("/filemanager")
})
app.get("/info", function (req, res) {
    var file_id = req.query.id
    var file_data = datatable.find(object => object.id == file_id)
    context = file_data
    res.render("info.hbs", context)
})
app.get('/download', function (req, res) {
    var file_id = req.query.id
    var file_data = datatable.find(object => object.id == file_id)
    res.download(file_data.path, file_data.name)
});
app.use(express.static('static'))
app.set('views', path.join(__dirname, 'views'))
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
    helpers: {
        shortName: function (text) {
            if (text.length > 20) {
                return text.substring(0, 17) + "...";
            }
            else {
                return text
            }
        },
    }
})); app.set('view engine', 'hbs')
app.listen(port, function () {
    console.log("Serwer został uruchomiony na porcie: " + port)
})