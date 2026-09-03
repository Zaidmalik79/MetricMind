import json
from pathlib import Path

BASE_DIR = Path(__file__).parent

with open(BASE_DIR / "metric_dictionary.json", "r") as file:
    metric_dict = json.load(file)


def normalize_query(question):
    question = question.lower()

    for metric, synonyms in metric_dict.items():
        for synonym in synonyms:
            question = question.replace(synonym.lower(), metric)

    return question


if __name__ == "__main__":
    query = "Show income by region"

    print(normalize_query(query))