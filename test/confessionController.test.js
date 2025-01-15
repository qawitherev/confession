const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;
const { createConfession } = require('../controller/confessionController');
const confessionQueries = require('../queries/confessionQueries');
const pool = require('../config/database');

describe('createConfession', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            body: {
                userId: 1,
                title: 'Test Title',
                body: 'Test Body'
            }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
            send: sinon.stub()
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return 400 if title or body is missing', async () => {
        req.body.title = '';
        await createConfession(req, res);
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.send.calledWith('Title and body is required')).to.be.true;
    });

    it('should return 201 and confessionId if successful', async () => {
        const pendingStatusId = 1;
        const insertId = 123;
        sandbox.stub(pool, 'query').resolves([{ insertId }]);
        sandbox.stub(confessionQueries, 'getPendingStatusId').resolves(pendingStatusId);

        await createConfession(req, res);
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith({ confessionId: insertId })).to.be.true;
    });

    it('should return 500 if there is an error', async () => {
        sandbox.stub(pool, 'query').rejects(new Error('Query error'));
        await createConfession(req, res);
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.send.calledWith('Error executing query. Query error')).to.be.true;
    });
});