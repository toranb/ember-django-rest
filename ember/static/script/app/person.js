(function () {
    window.PersonApp = Ember.Application.create({

        ApplicationController: Ember.ObjectController.extend({}),

        ApplicationView: Ember.View.extend({
            templateName: 'application'
        }),

        Person: DS.Model.extend({
            id: DS.attr('number'),
            username: DS.attr('string')
        }),

        Store: DS.Store.extend({
            revision: 4,
            adapter: DS.DjangoRESTAdapter.create({ 
                bulkCommit: false,
                plurals: {
                    person: 'people'
                }
            })
        }),

        PersonController: Ember.ArrayController.extend({
            content: []
        }),

        PersonView: Ember.View.extend({
            templateName: 'person'
        }),

        AddPersonTextField: Ember.TextField.extend({
            insertNewline: function () {
                var username = this.get('value');
                if (username) {
                    this.get('controller.target').send('addPerson', username);
                    this.set('value', '');
                }
            }
        }),

        Router: Ember.Router.create({
            root: Ember.Route.extend({
                index: Em.Route.extend({
                    route: '/',
                    addPerson: function(router, username) {
                        PersonApp.Person.createRecord({ id: 0, username: username });
                        router.get('store').commit();
                    },
                    updatePerson: function(router, event) {
                        router.get('store').commit();
                    },
                    removePerson: function(router, event) {
                        event.context.deleteRecord();
                        router.get('store').commit();
                    },
                    connectOutlets: function (router) {
                        router.get('applicationController').connectOutlet('person', router.get('store').findAll(PersonApp.Person));
                    }
                })
            })
        })

    });

    $(function () {
        PersonApp.initialize(PersonApp.Router);
    });

})();
