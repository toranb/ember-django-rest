PersonApp = Ember.Application.create({});

PersonApp.ApplicationController = Ember.ObjectController.extend({});

PersonApp.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

PersonApp.SearchField = Ember.TextField.extend({
  keyUp: function(e) {
    var search = this.get('value');
    this.get('controller.target').send('searchUsers', {match:search});
  }
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

PersonApp.PaginationItemView = Ember.View.extend({
  templateName: 'pagination_item',

  tagName: 'li',
  spanClasses: 'paginator pageNumber',

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

PersonApp.PersonController = Ember.ArrayController.extend(Ember.FilterSortSliceMixin, {
  content: [],
  sortBy: 'id',
  itemsPerPage: 4,
  paginationRoute: 'paginateUsers',
  sortableRoute: 'sortUsers'
});

PersonApp.Router = Ember.Router.create({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',
      paginateUsers: Ember.Route.transitionTo('paginated'),
      sortUsers: Ember.Route.transitionTo('sort'),
      searchUsers: Ember.Route.transitionTo('search'),
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
      connectOutlets: function(router, context) {
        router.get('applicationController').connectOutlet('person', router.get('store').findAll(PersonApp.Person));
      },
      index: Ember.Route.extend({
        route: '/'
      }),
      search: Ember.Route.extend({
        route: '/search/:match',
        connectOutlets: function(router, context) {
          router.get('personController').set('filterBy', context.match);
        },
        exit: function(router) {
          console.log("EX");
          router.get('personController').set('filterBy', '');
        }
      }),
      paginated: Ember.Route.extend({
        route: '/page/:page_id',
        connectOutlets: function(router, context) {
          router.get('personController').set('selectedPage', context.page_id);
        },
        exit: function(router) {
          router.get('personController').set('selectedPage', undefined);
        }
      }),
      sort: Ember.Route.extend({
        route: '/sort/:column/direction/:dir',
        connectOutlets: function(router, context) {
          router.set('personController.sortBy', context.column);
          router.set('personController.sortDirection', context.dir);
        },
        exit: function(router) {
          console.log("exiting"); //why is this called with each sort?
        }
      })
    })
  })
});

$(function () {
  PersonApp.initialize(PersonApp.Router);
});
