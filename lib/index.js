"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var storage = require("@google-cloud/storage");
var MulterGCS = /** @class */ (function () {
    function MulterGCS(opts) {
        var _this = this;
        this.getContentType = function (req, file) {
            return undefined;
        };
        this._handleFile = function (req, file, cb) {
            _this.getDestination(req, file, function (err, destination) {
                if (err)
                    return cb(err);
                _this.getFilename(req, file, function (err, filename) {
                    if (err)
                        return cb(err);
                    var gcFile = _this.gcsBucket.file(filename);
                    var streamOpts = {
                        predefinedAcl: _this.options.acl || "private",
                    };
                    var contentType = _this.getContentType(req, file);
                    if (contentType)
                        streamOpts.metadata = { contentType: contentType };
                    file.stream
                        .pipe(gcFile.createWriteStream(streamOpts))
                        .on("error", function (err) { return cb(err); })
                        .on("finish", function (file) {
                        return cb(null, {
                            path: "https://" + _this.options.bucket + ".storage.googleapis.com/" + filename,
                            filename: filename,
                        });
                    });
                });
            });
        };
        this._removeFile = function (req, file, cb) {
            var gcFile = _this.gcsBucket.file(file.filename);
            gcFile.delete();
        };
        opts = opts || {};
        this.getFilename = opts.filename || this.getFilename;
        this.getContentType = opts.contentType || this.getContentType;
        if (!opts.bucket)
            throw new Error("You have to specify bucket for Google Cloud Storage to work.");
        if (!opts.projectId)
            throw new Error("You have to specify project id for Google Cloud Storage to work.");
        if (!opts.credentials)
            throw new Error("You have to specify credentials for Google Cloud Storage to work.");
        this.gcobj = storage({
            projectId: opts.projectId,
            credentials: opts.credentials,
        });
        this.gcsBucket = this.gcobj.bucket(opts.bucket);
        this.options = opts;
    }
    MulterGCS.prototype.getFilename = function (req, file, cb) {
        cb(null, uuid_1.v4() + "_" + file.originalname);
    };
    MulterGCS.prototype.getDestination = function (req, file, cb) {
        cb(null, "");
    };
    return MulterGCS;
}());
exports.default = MulterGCS;
function storageEngine(opts) {
    return new MulterGCS(opts);
}
exports.storageEngine = storageEngine;
//# sourceMappingURL=index.js.map