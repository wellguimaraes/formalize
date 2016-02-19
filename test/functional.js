const Browser = require('zombie');
const formalize = require('../src/index');
const http = require('http');
const assert = require('assert');

const host = '127.0.0.1';
const port = 31234;

describe('formalize', function () {
    const browser = new Browser();

    before(() => {
        http.createServer((req, res) => {
                res.writeHead(200);
                res.end(`
                <body>
                    <form>
                        <input type="text" name="a" />
                        <input type="text" name="a.b[0]" />
                        <input type="text" name="a.b[1]" />
                        <input type="text" name="b.c" />
                        <input type="text" name="b.d[0].x" />
                        <input type="text" name="b.d[1].x" />
                    </form>
                </body>`);
            })
            .listen(port, host);
    });

    beforeEach((done) => {
        browser.visit(`http://${host}:${port}`, () => {
            global.document = browser.document;
            done();
        });
    });

    it('should convert filled form to basic object', function () {
        browser.fill('a', 'lorem');
        browser.fill('b.c', 'ipsum');

        var expected = {
            a: 'lorem',
            b: { c: 'ipsum' }
        };

        assert.deepEqual(expected, formalize.formToObject('form'));
    });

    it('should convert filled form to object with arrays', function () {
        browser.fill('a.b[0]', 'lorem');
        browser.fill('a.b[1]', 'ipsum');
        browser.fill('b.d[0].x', 'dolor');
        browser.fill('b.d[1].x', 'sit');

        var expected = {
            a: {b: ['lorem', 'ipsum']},
            b: {
                d: [
                    {x: 'dolor'},
                    {x: 'sit'}
                ]
            }
        };

        assert.deepEqual(expected, formalize.formToObject('form'));
    });

    it('should fill form with object values', function () {
        var obj = {
            a: 'lorem',
            b: {
                c: 'ipsum',
                d: ['dolor', 'sit']
            }
        };

        formalize.objectToForm(obj, 'form');

        assert.equal('lorem', document.querySelector('[name=a]').value);
        assert.equal('ipsum', document.querySelector('[name="b.c"]').value);
        assert.equal('dolor', document.querySelector('[name="b.d[0]"]').value);
        assert.equal('sit', document.querySelector('[name="b.d[1]"]').value);
    });

    it('should create a hidden field when the object field does not exist in the form', function () {
        var obj = {z: 'lorem'};
        formalize.objectToForm(obj, 'form');

        assert.equal('lorem', document.querySelector('[name=z]').value);
    });
});