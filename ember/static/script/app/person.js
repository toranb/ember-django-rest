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

PersonApp.Person = DS.Model.extend({
  id: DS.attr('number'),
  username: DS.attr('string')
});

PersonApp.Store = DS.Store.extend({
  revision: 4,
  adapter: DS.DjangoRESTAdapter.create({
    bulkCommit: false,
    plurals: {
      person: 'people'
    }
  })
});

PersonApp.PersonController = Ember.ArrayController.extend({
  content: []
});

PersonApp.Router = Ember.Router.create({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',
      addPerson: function(router, username) {
        PersonApp.Person.createRecord({ username: username });
        router.get('store').commit();
      },
      updatePerson: function(router, event) {
        router.get('store').commit();
      },
      removePerson: function(router, event) {
        event.context.deleteRecord();
        router.get('store').commit();
      },
      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('person', router.get('store').findAll(PersonApp.Person));
      }
    })
  })
});

$(function () {
  PersonApp.initialize(PersonApp.Router);
});
