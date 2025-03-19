# TinyWeather

Welcome to TinyWeather, a lightweight weather application built with React and TypeScript. This project provides a simple interface to view current weather conditions and forecasts, with features like location settings, unit toggling, and favorite locations. It’s designed to be extensible, with a focus on a clean, modern UI.

## Table of Contents
- [Getting Started](#getting-started)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Roadmap](#roadmap)
- [Changelog](#changelog)

## Getting Started

TinyWeather fetches weather data from the [Open-Meteo API](https://open-meteo.com/) and displays it in a user-friendly format. This README will guide you through setting up and running the project locally.

## Current Look 

![app](/docs/app.png)

## Features
- View current weather and 7-day forecast for any location by latitude and longitude.
- Toggle between Celsius and Fahrenheit temperature units.
- Burger menu for settings and location management.
- Add and store favorite locations.
- Visual weather condition icons using `react-icons`.
- Responsive design that fills the full screen.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tinyweather.git
   cd tinyweather
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure you have Node.js (version 18 or later) installed.

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173` (or the port specified in the terminal).

3. Use the burger menu to set a location by entering latitude and longitude (e.g., `51.5074, -0.1278` for London) and optionally add it to favorites.

4. Toggle between Celsius and Fahrenheit via the settings menu.


## Development

- **Build the project**:
  ```bash
  npm run build
  ```

- **Lint the code**:
  ```bash
  npm run lint
  ```

- **Preview the build**:
  ```bash
  npm run preview
  ```

- **Tech Stack**:
  - React 19
  - TypeScript
  - Vite
  - Axios (for API calls)
  - react-icons (for weather icons)

- **Code Style**: Follows ESLint rules defined in `eslint.config.js`.


## Contributing

Contributions are welcome! Please fork the repository and submit pull requests with your changes. Before contributing, ensure you:

- Follow the existing code style.
- Update the changelog with your changes.
- Test your changes locally.


## License

This project is licensed under the [MIT License](LICENSE). See the `LICENSE` file for details.

## Roadmap

- [ ] Add a search-by-city feature to convert city names to lat/lon.
- [ ] Implement mobile-specific optimizations.
- [ ] Add animated transitions for weather updates.
- [ ] Change theme


## Changelog

See the [CHANGELOG.md](CHANGELOG.md) file for detailed changes and version history.

---
