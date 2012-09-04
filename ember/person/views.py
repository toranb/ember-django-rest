from django.views.generic import TemplateView
from djangorestframework import views
from djangorestframework import mixins
from ember.person import resources

class HomeView(TemplateView):
    template_name = 'index.html'

class People(views.ListOrCreateModelView, mixins.CreateModelMixin):
    resource = resources.PersonResource

class Person(views.InstanceModelView):
    resource = resources.PersonResource
