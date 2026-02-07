# 🕉️ Shloka Sadhana

A beautiful, feature-rich React Native mobile application for practicing Hindu shlokas, mantras, and spiritual content. Built with Expo, TypeScript, and comprehensive testing.

[![Tests](https://img.shields.io/badge/tests-813%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)]()
[![Lint](https://img.shields.io/badge/lint-0%20errors-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## 📱 Features

### Core Features
- **📿 Practice Mode**: Guided mala counter with timer for shloka recitation
- **📚 Shloka Library**: Extensive collection of Hindu shlokas and mantras with meanings, translations, and benefits
- **🔊 Audio Support**: Built-in audio playback for proper pronunciation
- **🎯 Sankalp & Offering**: Set intentions and dedicate practice sessions
- **📊 Progress Tracking**: Track streaks, statistics, and practice history
- **🏆 Achievements**: Milestone celebrations and recovery encouragement

### Daily Features
- **🌅 Verse of the Day**: Daily rotating shloka based on weekday deities
- **💡 Daily Wisdom**: Rotating spiritual quotes from Hindu scriptures
- **📅 Panchang**: Daily Hindu calendar with tithi, nakshatra, and muhurat times
- **⏰ Auspicious Times**: Brahma Muhurta, Abhijit Muhurta, and Rahu Kaal
- **🌙 Ekadashi Calendar**: Complete calendar with significance and observance details
- **🎉 Hindu Festivals**: Comprehensive festival list with dates and details

### Community Features
- **👥 Satsang**: Global practitioners count and community features
- **📅 Upcoming Events**: Spiritual events calendar
- **🎪 Festival Information**: Detailed information about Hindu festivals

### Settings & Customization
- **🔔 Daily Reminders**: Configurable notification times
- **📖 About & Legal**: App information, privacy policy, and terms of service
- **🗑️ Data Management**: Clear all app data option

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vapmail16/shloka_sadhana.git
   cd shloka_sadhana
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on device**
   - **iOS**: Press `i` in terminal or `npx expo start --ios`
   - **Android**: Press `a` in terminal or `npx expo start --android`
   - **Web**: Press `w` in terminal or `npx expo start --web`

## 🧪 Testing

The app has comprehensive test coverage with 813 passing tests.

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- HomeScreen
```

### Test Coverage
- Unit tests for all utilities and hooks
- Component tests for all screens and components
- Integration tests for key workflows

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Run linter
npm run lint

# Run TypeScript type checking
npm run type-check

# Format code
npm run format

# Build for production
npm run build
```

### Code Quality

- **Linting**: ESLint with React Native and TypeScript rules
- **Type Checking**: Strict TypeScript configuration
- **Testing**: Jest with React Testing Library
- **Code Style**: Consistent formatting with ESLint

### Current Status
- ✅ **0 Lint Errors**
- ✅ **0 TypeScript Errors**
- ✅ **813/813 Tests Passing**
- ⚠️ **332 Lint Warnings** (mostly color literals - acceptable in React Native)

## 📂 Project Structure

```
shloka_sadhana/
├── src/
│   ├── components/          # Reusable components
│   │   ├── home/           # Home screen specific components
│   │   └── __tests__/      # Component tests
│   ├── screens/            # Main app screens
│   │   └── __tests__/      # Screen tests
│   ├── navigation/         # Navigation configuration
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   │   └── __tests__/      # Utility tests
│   ├── data/               # Static data and content
│   ├── constants/          # App constants and theme
│   ├── contexts/           # React contexts
│   └── types/              # TypeScript types
├── assets/                 # Images, icons, fonts
├── docs/                   # Documentation
└── __tests__/             # Root level tests
```

## 🎨 Key Technologies

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [React Navigation](https://reactnavigation.org/)
- **Storage**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Audio**: [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- **Notifications**: [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/react-native)
- **Linting**: [ESLint](https://eslint.org/)

## 📖 Documentation

- [Product Requirements Document](docs/PRD.md)
- [Project Status](docs/PROJECT_STATUS.md)
- [V3 Implementation Plan](docs/V3_IMPLEMENTATION_PLAN.md)
- [Technology Decisions](docs/TECHNOLOGY_DECISION.md)
- [TDD Workflow](docs/TDD_WORKFLOW_REACT_NATIVE.md)
- [Production Setup](docs/PRODUCTION_SETUP.md)
- [App Store Checklist](docs/APP_STORE_CHECKLIST.md)
- [OTA Updates Guide](docs/OTA_UPDATES_GUIDE.md)

## 🎯 Content

### Shlokas Included
- Gayatri Mantra
- Mahamrityunjaya Mantra
- Om Namah Shivaya
- Hanuman Chalisa
- Durga Chalisa
- And many more...

### Wisdom Quotes
- 100+ spiritual quotes from:
  - Bhagavad Gita
  - Upanishads
  - Yoga Sutras
  - Ramayana
  - And other Hindu scriptures

### Festivals & Observances
- Major Hindu festivals with dates
- Ekadashi dates and significance
- Monthly observances and fasts

## 🔐 Privacy & Data

- **Local Storage**: All data stored locally on device
- **No Analytics**: No third-party analytics or tracking
- **No Ads**: Clean, ad-free experience
- **Offline First**: Works completely offline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep commits atomic and well-described

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All shlokas and mantras are from ancient Hindu scriptures
- Wisdom quotes sourced from authentic Hindu texts
- Festival and Ekadashi data compiled from traditional Hindu calendars
- Built with respect for Hindu spiritual traditions

## 📧 Contact

For questions, suggestions, or feedback:
- **Email**: support@shlokasadhana.app
- **GitHub Issues**: [Create an issue](https://github.com/vapmail16/shloka_sadhana/issues)

## 🗺️ Roadmap

See [BACKLOG.md](docs/BACKLOG.md) and [POSSIBLE_FUTURE_IDEAS.md](docs/POSSIBLE_FUTURE_IDEAS.md) for planned features and ideas.

## 📊 Stats

- **Total Shlokas**: 30+
- **Wisdom Quotes**: 100+
- **Festivals**: 50+
- **Ekadashi Dates**: Complete yearly calendar
- **Code Coverage**: 813 tests
- **Supported Platforms**: iOS, Android, Web

---

Made with 🙏 and ❤️ for the global Hindu community

**Om Shanti Shanti Shanti**
