document.addEventListener('deviceready', function() {
    mocha.setup('bdd');
    var assert = chai.assert;
    var expect = chai.expect;

    describe("test description", function() {
        before(function() {
            return shell.exists('cdvfile://localhost/persistent/test').then(function(exists) {
                if(exists) {
                    return shell.remove('cdvfile://localhost/persistent/test')
                }
            })
        });

        it("create directory", function(done) {
            shell.exists('cdvfile://localhost/persistent/test').then(function (exists) {
                expect(exists).to.be.false;
                shell.mkdir('cdvfile://localhost/persistent/test').then(function(entry) {
                    expect(entry.isDirectory).to.be.true;
                    done();
                });
            });
        });

        it("create text", function(done) {
           shell.writeText("hello world", 'cdvfile://localhost/persistent/test/hello.txt').then(function(entry) {
              shell.readText('cdvfile://localhost/persistent/test/hello.txt').then(function(content) {
                  expect(content === "hello world").to.be.true;
                  done();
              })
           });
        });
        it("create JSON", function(done) {
            shell.writeJSON({
                hello : "world"
            }, 'cdvfile://localhost/persistent/test/hello.json').then(function(entry) {
                shell.readJSON('cdvfile://localhost/persistent/test/hello.json').then(function(content) {
                    expect(content.hello === "world").to.be.true;
                    done();
                })
            });
        });
        it('deep mkdir', function(done) {
            shell.mkdir('cdvfile://localhost/persistent/test/test1/test2/test3/test4/').then(function(entry) {
               expect(entry.isDirectory).to.be.true;
               done();
            });
        });

        it('download', function(done) {
            this.timeout(5000);
           shell.download('http://192.168.56.1:666/index.html', 'cdvfile://localhost/persistent/test/downloaded/index.html').then(function(entry) {
                shell.readText('cdvfile://localhost/persistent/test/downloaded/index.html').then(function(html) {
                    expect(html === '<h1>Fake Web Server Home</h1>').to.be.true;
                    done();
                })
           })
        });
        after(function() {

        });
    });

    mocha.run();
});