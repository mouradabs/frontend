import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const {computed, RSVP, isEmpty, isPresent} = Ember;
const {gt} = computed;
const {PromiseArray} = DS;

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  queryParams: {
    schoolId: 'school',
    yearTitle: 'year',
    titleFilter: 'filter',
    userCoursesOnly: 'mycourses'
  },
  placeholderValue: t('courses.titleFilterPlaceholder'),
  schoolId: null,
  yearTitle: null,
  titleFilter: null,
  userCoursesOnly: false,
  newCourses: [],
  courses: computed('selectedSchool', 'selectedYear', function(){
    let defer = RSVP.defer();
    let schoolId = this.get('selectedSchool').get('id');
    let yearTitle = this.get('selectedYear').get('title');
    if(isEmpty(schoolId) || isEmpty(yearTitle)){
      defer.resolve([]);
    } else {
      this.get('store').query('course', {
        filters: {
          school: schoolId,
          year: yearTitle,
          deleted: false
        },
        limit: 500
      }).then(courses => {
        defer.resolve(courses);
      });
    }
    
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: gt('model.schools.length', 1),
  allRelatedCourses: computed('currentUser.model', function(){
    let defer = RSVP.defer();
    this.get('currentUser.model').then(user => {
      defer.resolve(user.get('allRelatedCourses'));
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  filteredCourses: computed(
    'debouncedFilter',
    'courses.[]',
    'userCoursesOnly',
    'allRelatedCourses.[]',
    function(){
      let defer = RSVP.defer();
      let title = this.get('debouncedFilter');
      let filterMyCourses = this.get('userCoursesOnly');
      let exp = new RegExp(title, 'gi');
      this.get('courses').then(courses => {
        let filteredCourses;
        if(isEmpty(title)){
          filteredCourses = courses.sortBy('title');
        } else {
          filteredCourses = courses.filter(course => {
            return (isPresent(course.get('title')) &&course.get('title').match(exp)) ||
                   (isPresent(course.get('externalId')) &&course.get('externalId').match(exp));
          });
        }
        
        if(filterMyCourses){
          this.get('allRelatedCourses').then(allRelatedCourses => {
            let myFilteredCourses = filteredCourses.filter(course => {
              return allRelatedCourses.contains(course);
            });
            
            defer.resolve(myFilteredCourses);
          });
        } else {
          defer.resolve(filteredCourses);
        }
        
      });
      
      
      return PromiseArray.create({
        promise: defer.promise
      });
  
      
  }),
  selectedSchool: Ember.computed('model.schools.[]', 'schoolId', {
    get() {
      let schools = this.get('model.schools');
      if(isPresent(this.get('schoolId'))){
        return schools.find(school => {
          return school.get('id') === this.get('schoolId');
        });
      }
      
      return schools.get('firstObject');
    },
    set(key, school) {
      this.set('schoolId',  school.get('id'));
    }
  }),
  selectedYear: Ember.computed('model.years.[]', 'yearTitle', {
    get() {
      let years = this.get('model.years');
      if(isPresent(this.get('yearTitle'))){
        return years.find(year => {
          return year.get('title') === parseInt(this.get('yearTitle'));
        });
      }
      
      return years.get('lastObject');
    },
    set(key, year) {
      this.set('yearTitle',  year.get('title'));
    }
  }),
  actions: {
    editCourse: function(course){
      this.transitionToRoute('course', course);
    },
    removeCourse: function(course){
      this.get('model').removeObject(course);
      course.deleteRecord();
      course.save();
    },
    addCourse: function(){
      var courseProxy = Ember.ObjectProxy.create({
        isSaved: false,
        content: this.store.createRecord('course', {
          title: null,
          school: this.get('selectedSchool'),
          year: this.get('selectedYear.title'),
          level: 1,
        })
      });
      this.get('newCourses').addObject(courseProxy);
    },
    saveNewCourse: function(newCourse){
      let courseProxy = this.get('newCourses').find(proxy => {
        return proxy.get('content') === newCourse;
      });
      newCourse.setDatesBasedOnYear();
      newCourse.save().then(savedCourse => {
        courseProxy.set('content', savedCourse);
        courseProxy.set('isSaved', true);
      });
    },
    removeNewCourse: function(newCourse){
      let courseProxy = this.get('newCourses').find(proxy => {
        return proxy.get('content') === newCourse;
      });
      this.get('newCourses').removeObject(courseProxy);
    },
    changeSelectedYear: function(year){
      this.set('selectedYear', year);
    },
    changeSelectedSchool: function(school){
      this.set('selectedSchool', school);
    },
    //called by the 'toggle-mycourses' component
    toggleMyCourses: function(){
      //get the current userCoursesOnly status and flip it
      var newStatus = (! this.get('userCoursesOnly'));
      //then set it to the new status
      this.set('userCoursesOnly', newStatus);
    }
  },
});
