import {SimpleGulpGlob} from '../src/gulpglob';
import {expect} from 'chai';

describe(`Testing option base vs version option cwd`, function () {
  it(`Calling method src() with option {base: 'build'}`, function () {
    const ggSrc1 = new SimpleGulpGlob('src/**/*.js', {base: 'build'});
    const ggSrc2 = new SimpleGulpGlob('build/src/**/*.js', {base: 'build'});
    const ggSrc3 = new SimpleGulpGlob('src/../*.js', {base: 'build'});
    const ggSrc4 = new SimpleGulpGlob('../src/*.js', {base: 'build'});

    expect(ggSrc1.glob).to.eql(['../src/**/*.js']);
    expect(ggSrc2.glob).to.eql(['src/**/*.js']);
    expect(ggSrc3.glob).to.eql(['../*.js']);
    expect(ggSrc4.glob).to.eql(['../../src/*.js']);
  });

  it(`Calling method src() with option {cwd: 'build'}`, function () {
    const ggSrc1 = new SimpleGulpGlob('src/**/*.js', {cwd: 'build'});
    const ggSrc2 = new SimpleGulpGlob('build/src/**/*.js', {cwd: 'build'});
    const ggSrc3 = new SimpleGulpGlob('src/../*.js', {cwd: 'build'});
    const ggSrc4 = new SimpleGulpGlob('../src/*.js', {cwd: 'build'});

    expect(ggSrc1.glob).to.eql(['src/**/*.js']);
    expect(ggSrc2.glob).to.eql(['build/src/**/*.js']);
    expect(ggSrc3.glob).to.eql(['*.js']);
    expect(ggSrc4.glob).to.eql(['../src/*.js']);
  });
});
