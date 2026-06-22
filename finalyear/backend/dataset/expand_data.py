"""
DEPRECATED — DO NOT RUN.

This script was used once to expand datasets. Running it again will:
- OVERWRITE the careers.csv with USD salaries (we've converted to INR)
- Generate low-quality generic descriptions
- Create random skill assignments that don't make sense

The datasets have been manually curated. To modify datasets,
edit the CSV files directly.
"""
raise RuntimeError(
    "This script is deprecated. Edit CSV files directly instead. "
    "See backend/dataset/careers.csv for the curated Indian market data."
)
