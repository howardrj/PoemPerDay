from django.db import models

class Poem (models.Model):

    POEM_MAX_TITLE_LEN  = 400
    POEM_MAX_AUTHOR_LEN = 400

    title = models.CharField(
        help_text='Title of poem',
        max_length=POEM_MAX_TITLE_LEN,
        db_index=True)

    author = models.CharField(
        help_text='Author of poem',
        max_length=POEM_MAX_AUTHOR_LEN,
        db_index=True)

    date_selected = models.DateField(
        help_text='Date of when poem was selected',
        auto_now_add=True,
        unique=True,
        db_index=True)

    lines = models.TextField(
        help_text='Lines of poem')

    lines_count = models.PositiveIntegerField(
        help_text='Number of lines in poem',
        db_index=True)
