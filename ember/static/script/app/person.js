PersonApp = Ember.Application.create({});

PersonApp.ApplicationController = Ember.ObjectController.extend({});

PersonApp.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

PersonApp.PersonView = Ember.View.extend({
  templateName: 'person',
  addPerson: function(event) {
    var username = event.context.username;
    if (username) {
      this.get('controller.target').send('addPerson', username);
      event.context.set('username', '');
    }
  }
});

PersonApp.Person = Ember.Object.extend({
  username: null
});

PersonApp.PersonController = Ember.ArrayController.extend({
  content: [],

  addPerson: function(person) {
    this.pushObject(person);
  },

  removePerson: function(person) {
    this.removeObject(person);
  }
});

PersonApp.Router = Ember.Router.create({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',
      addPerson: function(router, username) {
        var person = PersonApp.Person.create({ username: username });
        router.get('personController').addPerson(person);
      },
      removePerson: function(router, event) {
        var person = event.context;
        router.get('personController').removePerson(person);
      },
      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('person');
      }
    })
  })
});

$(function () {
  PersonApp.initialize(PersonApp.Router);
});
