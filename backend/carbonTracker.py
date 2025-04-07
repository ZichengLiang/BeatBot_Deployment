from codecarbon import OfflineEmissionsTracker

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

