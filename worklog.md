---
Task ID: 1
Agent: Z.ai Code
Task: Major layout refactoring - Add Dashboard, Lists, History views with navigation

Work Log:
- Completely refactored page.tsx to implement new layout structure
- Added view state management (Home, Lists, History, Category, ListDetail)
- Implemented bottom navigation bar with 3 tabs: Home, Lists, History
- Added floating calculator icon at bottom-left (always visible)
- Implemented multi-item selection in category view with checkbox-style cards
- Added "Create List" button at top-right in category header when items are selected
- Created Lists view displaying all shopping lists with item counts and dates
- Created List Detail view for viewing and editing items with prices
- Implemented price calculation dialog that works for both standalone calculator and list item editing
- Added floating delete icon (bottom-left) in Lists and List Detail views
- Implemented History view for deleted lists with "Clear History" option
- Added delete confirmation dialog before moving lists to history
- Implemented localStorage persistence for shopping lists and history
- Updated swipe-back gesture to properly handle navigation (category → lists, detail → lists)
- Maintained all existing features: Hindi/Marathi number-to-words, Indian weight units, dairy-specific ml units
- Ensured theme-aware styling throughout all new components
- Removed old features section and offline notice from home screen as per requirements

Stage Summary:
- Successfully implemented complete list management system
- Home dashboard now shows only 4 main categories (Vegetables, Fruits, Dairy, Kirana)
- Bottom navigation provides easy access to Home, Lists, and History views
- Users can select multiple items in categories and create shopping lists
- Lists can be edited with price calculations and moved to history
- Floating calculator allows quick calculations without navigation
- All data persists in localStorage for offline use
- App compiled successfully with no lint errors
