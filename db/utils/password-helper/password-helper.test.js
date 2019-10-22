const passwordHelper = require('./password-helper');

describe('passwordHelper', () => {
    const password = 'TEST';
    let hash;

    beforeAll(async () => {
        hash = await passwordHelper.hash(password);
    });

    describe('hash', () => {
        it('should generate a password hash and return it', async () => {
            const hash = await passwordHelper.hash('TEST');
            expect(hash.constructor.name).toEqual('String');
            expect(hash).not.toEqual('TEST');
            expect(hash).not.toContain('TEST');
        });
    });

    describe('compare', () => {
        it('should compare a password against a hash and return `true` if it matches', async () => {
            const isValid = await passwordHelper.compare(password, hash);
            expect(isValid).toEqual(true);
        });

        it('should compare a password against a hash and return `false` if it does not match', async () => {
            const isValid = await passwordHelper.compare('__TEST__', hash);
            expect(isValid).toEqual(false);
        });
    });
});
