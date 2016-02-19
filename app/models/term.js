import DS from 'ember-data';
import Ember from 'ember';

const { computed } =  Ember;
const { empty } = computed;

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  vocabulary: DS.belongsTo('vocabulary', {async: true}),
  parent: DS.belongsTo('term', { inverse: 'children', async: true }),
  children: DS.hasMany('term', { inverse: 'parent', async: true }),
  isTopLevel: empty('parent.content'),

  allParents: computed('parent', 'parent.allParents.[]', function(){
    var deferred = Ember.RSVP.defer();
    this.get('parent').then(parent => {
      var parents = [];
      if(!parent){
        deferred.resolve(parents);
      } else {
        parents.pushObject(parent);
        parent.get('allParents').then(allParents => {
          parents.pushObjects(allParents);
          deferred.resolve(parents);
        });
      }
    });
    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }),

  termWithAllParents: computed('allParents', function(){
    let deferred = Ember.RSVP.defer();
    let terms = [];
    let term = this;
    this.get('allParents').then(allParents => {
      terms.pushObjects(allParents);
      terms.pushObject(term);
      deferred.resolve(terms);
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }),

  allParentTitles: computed('parent.{title,allParentTitles}', function() {
    let deferred = Ember.RSVP.defer();

    this.get('parent').then(parent => {
      let titles = [];
      if(!parent){
        deferred.resolve(titles);
      } else {
        parent.get('allParents').then(parents => {
          titles = titles.concat(parents.mapBy('title'));
          titles.push(this.get('parent.title'));
          deferred.resolve(titles);
        });
      }
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
    });

  }),

  titleWithParentTitles: computed('title', 'allParentTitles', function() {
    let deferred = Ember.RSVP.defer();
    this.get('allParentTitles').then(parentTitles => {
      let title;
      if (! parentTitles.get('length')) {
        title = this.get('title');
      } else {
        title = parentTitles.join(' > ') + ' > ' + this.get('title');
      }
      deferred.resolve(title);
    });

    return DS.PromiseObject.create({
      promise: deferred.promise
    });
  }),
});
