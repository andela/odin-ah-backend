import chai from 'chai';

const { expect } = chai;

describe('Dummy test',()=>{
    it('should check if dummy test works', () => {
        expect('Authors Haven').to.be.a('string');
    })
})