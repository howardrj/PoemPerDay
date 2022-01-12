from poem_per_day.models import Poem
from rest_framework import viewsets
from django.shortcuts import render

from poem_per_day.serializers import PoemSerializer

class PoemViewSet (viewsets.ModelViewSet):

    serializer_class = PoemSerializer
    queryset         = Poem.objects.all()

def poem_of_the_day (request):

    context_dict = {}

    # Get poems in reverse order
    poems = Poem.objects..order_by('-id')

    if len(poems):
        context_dict['poem'] = poems[0]

    return render(request, 'poem_of_the_day.html', context_dict)
