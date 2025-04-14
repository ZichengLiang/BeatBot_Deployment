from codecarbon import OfflineEmissionsTracker
import pandas as pd

class CarbonTracker:
    def __init__(self, output_file = "/app/emissions.csv"
, country_iso_code="USA"):
        self.tracker = OfflineEmissionsTracker(
            output_file=output_file,
            country_iso_code=country_iso_code
        )

    def __enter__(self):
        """Start tracking when entering the context."""
        self.tracker.start()
        print("Carbon emissions tracking started.")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """Stop tracking when exiting the context."""
        self.tracker.stop()
        print("Carbon emissions tracking stopped. Data saved to app emissions.csv.")

    def print_emissions(self, fileName = "emissions.csv"):
        try:
            print(f"Attempting to read emissions from: {fileName}")  # Debug print
            file = pd.read_csv(fileName)
            print(f"File contents: {file}")  # Debug print
            
            # Calculate total emissions and energy consumed
            total_emissions = file["emissions"].sum()
            total_energy = file["energy_consumed"].sum()
            
            result = {
                "total_emissions": f"{total_emissions:.6f}",
                "total_energy": f"{total_energy:.6f}"
            }
            print(f"Calculated emissions data: {result}")  # Debug print
            return result
            
        except FileNotFoundError as e:
            print(f"File not found: {fileName}")  # Debug print
            raise e
        except Exception as e:
            print(f"Error reading emissions file: {str(e)}")  # Debug print
            raise e

    
