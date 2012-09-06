PersonApp = Ember.Application.create({});

PersonApp.Person = Ember.Object.extend({
    username: null
});

PersonApp.AddPersonForm = Ember.View.extend({
    addPerson: function(event) {
        var username = event.context.username;
        if (username) {
            PersonApp.personController.addPerson(username);
            event.context.set('username', '');
        }
    }
});

PersonApp.PersonView = Ember.View.extend({
    removePerson: function(event) {
        PersonApp.personController.removePerson(event.context);
    }
});

PersonApp.personController = Ember.ArrayProxy.create({
    content: [],

    addPerson: function(username) {
        var person = PersonApp.Person.create({ username: username });
        this.pushObject(person);
    },

    removePerson: function(person) {
        this.removeObject(person);
    }
});
