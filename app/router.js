import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('dashboard', function() {
    this.route('day');
    this.route('week');
    this.route('month');
    this.route('year');
  });
  this.resource('programs', function(){
    this.route('index');
    this.resource('programsschool', { path: 'school/:school_id'}, function(){
      this.route('index');
      this.route('new');
      this.resource('program', { path: 'program/:program_id' }, function(){
        this.route('index');
        this.route('edit');
        this.resource('programyear', { path: 'years/:program_year_id' }, function(){
          this.route('index');
          this.route('managecompetencies');
          this.route('manageobjectives');
          this.route('managedirectors');
          this.route('managetopics');
          this.route('managestewardingschools');
        });
      });
    });
  });
  this.route('courses');
  this.route('course', { path: 'course/:course_id'});
  this.route("courseobjective", {path: 'courseobjective/:objective_id'});
  this.route("courselearningmaterial", {path: 'courselearningmaterial/:course_learning_material_id'});

  this.route('instructorgroups');
  this.route('instructorgroup', { path: 'instructorgroup/:instructor_group_id'});

  this.route('learnergroups');
  this.route('learnergroup', { path: 'learnergroup/:learner_group_id'});

  this.route("testmodels");
  this.route("loading");

  this.route("testmodels");
  this.route("learnergroups");
  this.route("learnergroup", { path: 'learnergroup/:learner_group_id'});
  this.route("instructorgroups");
  this.route("session", {path: 'session/:session_id'});
  this.route('sessionobjective', {path: 'sessionobjective/:objective_id'});
  this.route("sessionlearningmaterial", {path: 'sessionlearningmaterial/:session_learning_material_id'});
});

export default Router;
