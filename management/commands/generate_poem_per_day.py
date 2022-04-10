import logging
import requests
import json
import datetime
from datetime import datetime, timedelta, date, time
from time import sleep

from django.conf import settings
from django.core.management.base import BaseCommand

from poem_per_day.models import Poem

logger = logging.getLogger(settings.PROJECT_NAME)

class Command(BaseCommand):

    COMMAND_SLEEP_TIME_AFTER_ERROR = 10
    COMMAND_RANDOM_POEM_URL = 'https://poetrydb.org/random'
    COMMAND_POEM_MAX_LINES = 100

    def add_arguments (self, parser):
        pass

    def seconds_until_tomorrow (self):

        # From https://dev.to/vladned/calculating-the-number-of-seconds-until-midnight-383d
        now = datetime.now()
        midnight = datetime.combine(now + timedelta(days=1), time())

        return (midnight - now).seconds + 1

    def handle (self, *args, **options):

        while True:

            logger.info("Checking if new poem needs to be generated")

            current_date = date.today().strftime('%Y-%m-%d')

            if len(Poem.objects.all().filter(date_selected=current_date)):

                seconds_to_wait = self.seconds_until_tomorrow()

                logger.error("Poem already exists for %s. Trying again in %d seconds",
                             current_date, seconds_to_wait)
                             
                sleep(seconds_to_wait)
                continue

            try:
                response = requests.get(self.COMMAND_RANDOM_POEM_URL)
            except Exception as e:
                logger.error("Failed to retrieve random poem - %s", e)
                sleep(self.COMMAND_SLEEP_TIME_AFTER_ERROR)
                continue

            if response.status_code != 200:
                logger.error("Failed to get random poem - %d", response.status_code)
                sleep(self.COMMAND_SLEEP_TIME_AFTER_ERROR)
                continue

            if not response.content:
                logger.error("No content was returned")
                sleep(self.COMMAND_SLEEP_TIME_AFTER_ERROR)
                continue

            try:
                random_poems = json.loads(response.content)
            except Exception as e:
                logger.error("Failed to decode content - '%s': %s", response.content, e)
                sleep(self.COMMAND_SLEEP_TIME_AFTER_ERROR)
                continue

            if not len(random_poems):
                logger.error("No random poems were returned - '%s'", response.content)
                sleep(self.COMMAND_SLEEP_TIME_AFTER_ERROR)
                continue

            random_poem = random_poems[0]

            if int(random_poem['linecount']) > self.COMMAND_POEM_MAX_LINES:
                logger.error("Poem is too long (%s lines)", random_poem['linecount'])
                continue

            try:
                poem = Poem()

                logger.info("Inserting poem - (%s, %s)", random_poem['title'], random_poem['author'])

                poem.title = random_poem['title']
                poem.author = random_poem['author']
                poem.lines = "\n".join(random_poem['lines']) # Join lines together with newline character
                poem.lines_count = random_poem['linecount']

                poem.save()

            except Exception as e:
                logger.error("Failed to create poem - %s", e)
                sleep(self.COMMAND_SLEEP_TIME_AFTER_ERROR)
                continue

            seconds_to_wait = self.seconds_until_tomorrow()

            logger.info("Successfully inserted poem. Checking again in %d seconds",
                        seconds_to_wait)

            sleep(seconds_to_wait)
