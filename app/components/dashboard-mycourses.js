import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  tagName: 'div',
  classNames: ['dashboard-block'],
  listOfCourses: Ember.computed('currentUser.model.allRelatedCourses.[]', function(){
    let defer = Ember.RSVP.defer();
    this.get('currentUser').get('model').then( user => {
      user.get('allRelatedCourses').then( courses => {
        let filteredCourses = courses.filter(course => {
          return (!course.get('locked') && !course.get('archived'));
        });
        defer.resolve(filteredCourses.sortBy('startDate'));
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
});
