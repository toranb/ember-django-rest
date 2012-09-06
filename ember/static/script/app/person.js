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
  id: 0,
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
        PersonApp.PersonRepository.add(person);
      },
      updatePerson: function(router, event) {
        PersonApp.PersonRepository.update(event.context);
      },
      removePerson: function(router, event) {
        var person = event.context;
        router.get('personController').removePerson(person);
        PersonApp.PersonRepository.remove(person);
      },
      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('person', PersonApp.PersonRepository.find());
      }
    })
  })
});

PersonApp.PersonRepository = Ember.Object.create({
  people: [],
  url: 'http://localhost:8000/people',
  find: function(){
    var that = this;
    $.getJSON(this.url, {}, function(response){
      response.forEach(function(user){
        var person = PersonApp.Person.create({ id: user['id'], username: user['username'] });
        that.people.addObject(person);
      }, this)
    });
    return this.people;
  },
  add: function(person) {
    $.ajax({
      url: this.url,
      type: 'POST',
      data: 'username=%@'.fmt(person.username),
      success: function(response) { person.id = response.id; },
      error: function(response) { console.log('add failed-tell the user or retry'); }
    })
  },
  update: function(person) {
    $.ajax({
      url: '%@/%@'.fmt(this.url, person.id),
      type: 'PUT',
      data: 'username=%@'.fmt(person.username),
      error: function(response) { console.log('update failed-tell the user or retry'); }
    })
  },
  remove: function(person) {
    $.ajax({
      url: '%@/%@'.fmt(this.url, person.id),
      type: 'DELETE',
      data: {},
      error: function(response) { console.log('delete failed-tell the user or retry'); }
    })
  }
});

$(function () {
  PersonApp.initialize(PersonApp.Router);
});
