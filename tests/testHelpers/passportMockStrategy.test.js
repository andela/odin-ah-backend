import chai from 'chai';
import { MockStrategy } from '../../helpers/passportMockStrategy';

const { expect } = chai;

describe('MockStrategy class', () => {
  it('should throw an error if instantiated with an empty strategy name', (done) => {
    const createMockStrategy = () => new MockStrategy('', () => {});
    expect(createMockStrategy).to.throw(TypeError);
    done();
  });

  it('should throw an error if instantiated without a strategy name', (done) => {
    const createMockStrategy = () => new MockStrategy(null, () => {});
    expect(createMockStrategy).to.throw(TypeError);
    done();
  });
});
