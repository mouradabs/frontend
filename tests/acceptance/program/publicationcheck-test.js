import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
module('Acceptance: Program - Publication Check', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('objective');
    server.create('term');
    server.create('competency');
    server.create('program', {
      programYears: [1]
    });
    fixtures.fullProgramYear = server.create('programYear', {
      startYear: 2013,
      school: 1,
      program: 1,
      directors: [4136],
      objectives: [1],
      terms: [1],
      competencies: [1],
    });
    fixtures.emptyProgramYear = server.create('programYear', {
      startYear: 2013,
      school: 1,
      program: 1
    });
    server.createList('cohort', 2);
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('full program count', function(assert) {
  visit('/programs/1/programyears/' + fixtures.fullProgramYear.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.publicationCheck');
    var items = find('.programyear-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('2013 - 2014'));
    assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
  });
});

test('empty program count', function(assert) {
  visit('/programs/1/programyears/' + fixtures.emptyProgramYear.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.publicationCheck');
    var items = find('.programyear-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('2013 - 2014'));
    assert.equal(getElementText(items.eq(1)), getText('No'));
    assert.equal(getElementText(items.eq(2)), getText('No'));
    assert.equal(getElementText(items.eq(3)), getText('No'));
    assert.equal(getElementText(items.eq(4)), getText('No'));
  });
});
