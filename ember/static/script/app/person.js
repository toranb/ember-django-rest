PersonApp = Ember.Application.create({
  sortApp: Ember.Router.QueryParameters.create({ sortBy: 'username' }),
  pageApp: Ember.Router.QueryParameters.create({ selectedPage: '2' }),
});

PersonApp.SearchField = Ember.TextField.extend({
    keyUp: function(e) {
        var search = this.get('value');
        var settings = this.get('controller').getProperties('selectedPage', 'sortBy');
        settings.filterBy = search;
        var params = Ember.Router.QueryParameters.create(settings);
        this.get('controller.target').transitionTo('person', params);
    }
});

PersonApp.PersonView = Ember.View.extend({
    templateName: 'person',
    addPerson: function(event) {
        var username = this.get('username');
        if (username) {
            this.get('controller').addPerson(username);
            this.set('username', '');
        }
    }
});

PersonApp.PersonController = Ember.ArrayController.extend(Ember.FilterSortSliceMixin, {
    itemsPerPage: 2,
    addPerson: function(username) {
        PersonApp.Person.createRecord({ username: username });
        this.commit();
    },
    updatePerson: function(event) {
        this.commit();
    },
    deletePerson: function(event) {
        event.deleteRecord();
        this.commit();
    },
    commit: function() {
        this.get('store').commit();
    }
});

PersonApp.Person = DS.Model.extend({
    username: DS.attr('string')
});

//DS.DjangoRESTAdapter.configure("plurals", {"person" : "people"});
PersonApp.Store = DS.Store.extend({
    adapter: 'DS.FixtureAdapter'
});

PersonApp.Person.FIXTURES = [{
    id: 1, username: "toranz"
}];
// PersonApp.Store = DS.Store.extend({
//     revision: 12,
//     adapter: DS.DjangoRESTAdapter.create()
// });

PersonApp.Page = Ember.Object.extend({
    term: '',
    column: ''
});

PersonApp.PaginationView = Ember.View.extend({
    templateName: 'pagination',
    tagName: 'li',
    spanClasses: 'paginator pageNumber',

    page: function() {
        return PersonApp.Page.create({id: this.get('content.page_id')});
    }.property(),

    isActive: function() {
        var currentPage = this.get('parentView.controller.currentPage');
        var page_id = this.get('content.page_id');

        if(currentPage) {
            return currentPage.toString() === page_id.toString();
        } else {
            return false;
        }
    }.property('parentView.controller.currentPage')
});

PersonApp.Router.map(function(match) {
    this.resource("other", { path: "/" });
    this.resource("person", { path: "/person" });
});

PersonApp.OtherRoute = Ember.Route.extend({
    redirect: function() {
        this.transitionTo('person');
    }
});

PersonApp.PersonRoute = Ember.Route.extend({
  observesParameters: ['selectedPage', 'filterBy', 'sortBy'],
  model: function(params) {
    return PersonApp.Person.find();
  },
  setupController: function(controller, model) {
    this._super(controller, model)
    var params = this.get('queryParameters');
    var page = params.selectedPage || '1';
    var sort = params.sortBy || 'id';
    var search = params.filterBy || '';
    controller.set('selectedPage', page);
    controller.set('filterBy', search);
    controller.set('sortBy', sort);
  }
});
