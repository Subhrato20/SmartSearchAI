import os
import re

def check_first_line_is_url(directory_paths):
    """Checks if the first line of each .txt file in given directories is a URL."""
    url_pattern = re.compile(r"^https?://\S+$")  # Regex for URLs starting with http or https
    invalid_files = []

    for directory in directory_paths:
        if not os.path.exists(directory):
            print(f"Directory not found: {directory}")
            continue

        for file_name in os.listdir(directory):
            file_path = os.path.join(directory, file_name)
            if file_name.endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    first_line = f.readline().strip()

                if not url_pattern.match(first_line):  # Check if first line matches URL pattern
                    invalid_files.append(file_path)

    if invalid_files:
        print("\nThe following files do NOT have a URL as the first line:")
        for file in invalid_files:
            print(f"- {file}")
    else:
        print("\nAll files have a valid URL as the first line.")

# Example Usage
directories = [
    "../text_data/tvdata",
    "../text_data/internet",
    "../text_data/mobile",
    "../text_data/home_solution",
    "../text_data/home_phone",
    "../text_data/misc"
]

check_first_line_is_url(directories)
