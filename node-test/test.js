var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
const fsPromises = require('fs').promises;
var shell = require('./node-shell');
function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}
describe('ls()', function() {
    before(function() {
        shell.consoleLog(true);
        return shell.exists('./node-test/test').then(function(exists) {
            if(exists) {
                return shell.remove('./node-test/test')
            }
        })
    });
    it('should return modificationTime as Date', function(done) {
        shell.ls('./').then(entries => {
            entries.forEach(entry => {
                //console.log(entry);
                expect(isValidDate(entry.modificationTime)).to.be.true;
            });
            done();
        });
    });
    it("create directory", function(done) {
        shell.exists('./node-test/test').then(function (exists) {
            //expect(exists).to.be.false;
            console.log("here we are")
            shell.mkdir('./node-test/test').then(entry => {
                expect(entry.isDirectory).to.be.true;
                done();
            });
        });
    });
    it("create text", function(done) {
        shell.writeText("hello world", './node-test/test/hello.txt').then(function(entry) {
            console.log("OK HERE")
            shell.readText('./node-test/test/hello.txt').then(function(content) {
                expect(content === "hello world").to.be.true;
                done();
            })
        });
    });
    it("create JSON", function(done) {
        shell.writeJSON({
            hello : "world"
        }, './node-test/test/hello.json').then(function(entry) {
            shell.readJSON('./node-test/test//hello.json').then(function(content) {
                expect(content.hello === "world").to.be.true;
                done();
            })
        });
    });
    it('deep mkdir', function(done) {
        shell.mkdir('./node-test/test/test1/test2/test3/test4/').then(function(entry) {
            expect(entry.isDirectory).to.be.true;
            done();
        });
    });
    it('download', function(done) {
        this.timeout(5000);
        shell.download('http://192.168.56.1:666/index.html', './node-test/test/downloaded/index.html').then(function(entry) {
            shell.readText('./node-test/test/downloaded/index.html').then(function(html) {
                expect(html === '<h1>Fake Web Server Home</h1>').to.be.true;
                done();
            })
        })
    });

});