PersonApp = Ember.Application.create();
PersonApp.SearchField = Ember.TextField.extend({
    keyUp: function(e) {
        var search = this.get('value');
        this.get('controller').send('search', {term:search}); //this is broken in v2
    }
});

PersonApp.PersonView = Ember.View.extend({
    templateName: 'person',
    addPerson: function(event) {
        var username = event.get('username'); //run tests?
        if (username) {
            this.get('controller').addPerson(username);
            event.set('username', ''); //tdd
        }
    }
});

PersonApp.PersonController = Ember.ArrayController.extend(Ember.FilterSortSliceMixin, {
    content: [],
    sortBy: 'id',
    itemsPerPage: 2,
    paginationRoute: 'pagination',
    sortableRoute: 'sort',
    addPerson: function(username) {
        PersonApp.Person.createRecord({ username: username });
        this.commit();
    },
    updatePerson: function(event) {
        this.commit();
    },
    deletePerson: function(event) {
        event.deleteRecord(); //tdd
        this.commit();
    },
    commit: function() {
        this.get('store').commit();
    }
});

PersonApp.Person = DS.Model.extend({
    username: DS.attr('string')
});

DS.DjangoRESTAdapter.configure("plurals", {"person" : "people"});
PersonApp.Store = DS.Store.extend({
    revision: 11,
    adapter: DS.DjangoRESTAdapter.create()
});

PersonApp.Page = Ember.Object.extend({
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

// PersonApp.Router.map(function(match) {
//     match("/").to("person", function(match) {
//       match("/").to("person");
//       match("/page/:page_id").to("person");
//     });
//     match("/search/:term").to("search");
//     match("/sort/:column/direction/:dir").to("sort");
// });

PersonApp.Router.map(function(match) {
    this.resource("person", { path: "/" }, function() {
        this.route("page", { path: "/page/:page_id" });
    });
    this.resource("search", { path: "/search/:term" });
    this.resource("sort", { path: "/sort/:column/direction/:dir" });
});

PersonApp.PersonRoute = Ember.Route.extend({
    selectedPage: 1,
    model: function(params) {
        if (get(params, 'page_id') !== undefined) {
            this.selectedPage = get(params, 'page_id');
        } else {
            this.selectedPage = 1;
        }
        this.controllerFor('person').set('selectedPage', this.selectedPage);
        return PersonApp.Person.find();
    },
    setupController: function(controller, page) {
        controller.set('content', PersonApp.Person.find());
        if (page.get('id') !== undefined) {
            this.selectedPage = page.get('id');
        }
        controller.set('selectedPage', this.selectedPage);
    }
});

PersonApp.SortRoute = Ember.Route.extend({
    sortBy: '',
    sortDirection: 'asc',
    renderTemplates: function() {
        var controller = this.controllerFor('person');
        this.render('person', {
            into: 'application',
            outlet: 'person',
            controller: controller
        });
    },
    model: function(params) {
        this.sortBy = params.column;
        this.sortDirection = params.dir;
        return PersonApp.Person.find();
    },
    setupController: function(controller, page_id) {
        this.controllerFor('person').set('sortBy', this.sortBy);
        this.controllerFor('person').set('sortDirection', this.sortDirection);
    }
});

PersonApp.SearchRoute = Ember.Route.extend({
    filterBy: '',
    renderTemplates: function() {
        var controller = this.controllerFor('person');
        this.render('person', {
            into: 'application',
            outlet: 'person',
            controller: controller
        });
    },
    model: function(params) {
        this.filterBy = params.term;
        return PersonApp.Person.find();
    },
    setupController: function(controller, page_id) {
        this.controllerFor('person').set('filterBy', this.filterBy);
    }
});
