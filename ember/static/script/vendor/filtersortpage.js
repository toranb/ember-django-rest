var get = Ember.get, set = Ember.set;

/**
 *   @extends Ember.Mixin
 *
 *     Implements common pagination and sort behavior for array controllers
 *     */
Ember.FilterSortSliceMixin = Ember.Mixin.create({

  filterBy: '',
  sortDirection: 'asc',

  availableColumns: function() {
    //var columns = this.get('content').get('type.ClassMixin.ownerConstructor.attributes.keys').toArray();
    var columns = ['id', 'username'];
    columns.unshift('id');
    return columns;
  }.property(),

  sortColumns: function() {

    var sortable = [];
    var attributes = this.get('availableColumns');
    var exclude = this.get('excludeSort');

    for (var i = 0; i < attributes.length; i++) {
      sortable.push({ column: attributes[i], dir: 'asc' });
    }
    return sortable;

  }.property(),

  sortby: function() {
    var sortby = event.context.column;
    var incomingDirection = event.context.dir;
    var route = this.get('sortableRoute');
    var currentSortBy = this.get('sortBy');
    var currentSortDirection = this.get('sortDirection');
    var direction = 'asc';

    if (sortby === currentSortBy) {
      if (incomingDirection === currentSortDirection) {
        direction = 'desc';
      }
    }

    this.get('target').send(route, {column:sortby,dir:direction});
  }.property(),

  pages: function() {

    var availablePages = this.get('availablePages'),
    pages = [],
    page;

    for (i = 0; i < availablePages; i++) {
      page = i + 1;
      pages.push({ page_id: page.toString() });
    }

    return pages;

  }.property('availablePages'),

  currentPage: function() {

    return parseInt(this.get('selectedPage'), 10) || 1;

  }.property('selectedPage'),

  nextPage: function() {

    var nextPage = this.get('currentPage') + 1;
    var availablePages = this.get('availablePages');

    if (nextPage <= availablePages) {
        return PersonApp.Page.create({id: nextPage});
    }else{
        return PersonApp.Page.create({id: this.get('currentPage')});
    }

  }.property('currentPage', 'availablePages'),

  prevPage: function() {

    var prevPage = this.get('currentPage') - 1;

    if (prevPage > 0) {
        return PersonApp.Page.create({id: prevPage});
    }else{
        return PersonApp.Page.create({id: this.get('currentPage')});
    }

  }.property('currentPage'),

  availablePages: function() {

    return Math.ceil((this.get('filteredContent.length') / this.get('itemsPerPage')) || 1);

  }.property('filteredContent.length'),

  paginatedContent: function() {

    var selectedPage = this.get('selectedPage') || 1;
    var upperBound = (selectedPage * this.get('itemsPerPage'));
    var lowerBound = (selectedPage * this.get('itemsPerPage')) - this.get('itemsPerPage');
    var sorted = this.get('sortedContent');

    return sorted.slice(lowerBound, upperBound);

  }.property('selectedPage', 'sortedContent.@each'),

  sortedContent: function() {
    var sortby = this.get('sortBy') || 'id';
    var direction = this.get('sortDirection');
    var filtered = this.get('filteredContent');

    var sorted = filtered.toArray().sort(function(a,b) {
      if (direction === 'asc') {
        return Ember.compare(get(a, sortby), get(b, sortby));
      }else{
        return Ember.compare(get(b, sortby), get(a, sortby));
      }
    });

    return sorted;

  }.property('sortDirection', 'sortBy', 'filteredContent.@each'),

  filteredContent: function() {
    var self = this;
    var filter = this.get('filterBy').trim();

    if (filter.length > 0) {
      var regex = new RegExp(filter.toLowerCase());
      var attributes = this.get('availableColumns');

      var propertyFilter = attributes.map(function(property) {
        return self.get('content').filter(function(object) {
          var value = object.get(property).toString().toLowerCase();
          return regex.test(value);
        });
      });

      return propertyFilter.reduce(function(a, b) { return a.concat(b); }).uniq();
    }

    return this.get('content');

  }.property('filterBy', 'content.@each')

});
