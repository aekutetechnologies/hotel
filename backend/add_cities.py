import requests
from bs4 import BeautifulSoup
from django.utils import timezone
import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')  # Replace 'your_project' with your project name
django.setup()

from property.models import City, State  # Replace 'your_app' with your app name

def scrape_cities_and_states():
    urls = [
        "https://en.wikipedia.org/wiki/List_of_towns_in_India_by_population",
        "https://en.wikipedia.org/wiki/List_of_cities_in_India_by_population"
    ]

    for url in urls:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        # Find the relevant table (this may need adjustment based on the actual table structure)
        tables = soup.find_all('table', {'class': 'wikitable'})
        
        for table in tables:
            header_row = table.find('tr')
            if header_row:
                headers = [th.text.strip().lower() for th in header_row.find_all('th')]
                towns_col_index = -1
                state_col_index = -1

                for index, header in enumerate(headers):
                    if 'town' in header or 'city' in header:
                        towns_col_index = index
                    if 'state' in header:
                        state_col_index = index

                if towns_col_index != -1 and state_col_index != -1:
                    rows = table.find_all('tr')[1:]  # Skip header row
                    for row in rows:
                        columns = row.find_all('td')
                        if columns and len(columns) > max(towns_col_index, state_col_index):
                            city_name = columns[towns_col_index].text.strip()
                            state_name = columns[state_col_index].text.strip()

                            # Create or get state object
                            state, state_created = State.objects.get_or_create(name=state_name)

                            # Create or get city object
                            city, city_created = City.objects.get_or_create(name=city_name, defaults={'is_active': True})
                            city.created_at = timezone.now()
                            city.updated_at = timezone.now()
                            city.save()

                else:
                    pass
            else:
                pass

if __name__ == "__main__":
    scrape_cities_and_states()
