# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for MIDI processing
RUN apt-get update && apt-get install -y \
    libasound2-dev \
    libjack-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt


# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Expose port 5001 (matches the frontend's API_BASE_URL)
EXPOSE 5001

# Start the application
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]