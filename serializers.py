from poem_per_day.models import Poem
from rest_framework import serializers

class PoemSerializer (serializers.ModelSerializer):

    class Meta:
        model = Poem
        fields = '__all__'

        # Set all fields to read only
        read_only_fields = [f.name for f in Poem._meta.get_fields()]
