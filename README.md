# SabjiRate - Shopping List & Price Calculator

A shopping list application with Indian weight units and price calculations for vegetables, fruits, and grocery items.

## Features

- 🥬 **Multiple Categories**: Vegetables & Fruits, Kirana/Grocery, Dairy
- 📊 **Price Calculator**: Calculate prices for different weights (250g to 1KG)
- 💰 **Multi-Unit Support**: Indian weights (Chatak, Pav, Kilo) and Packets
- 🗂️ **List Management**: Create, view, edit, and delete shopping lists
- 🌐 **Bilingual Display**: Prices in Hindi (रुपये) and Marathi (रुपये)
- 🌙 **Dark Mode**: Toggle between light and dark themes
- ✏️ **Custom Items**: Add items not in the predefined catalog

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: SQLite with Prisma ORM
- **State**: React hooks (useState, useEffect)

## Installation

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── sabjirate-seed.ts   # Product data & categories
│   │   └── db.ts             # Database client
│   └── hooks/
└── prisma/
    └── schema.prisma            # Database schema
```

## Categories

### 🥬 Fruits & Vegetables
- Vegetables (सब्जियां)
- Fruits (फळ्या)

### 🧺 Kirana / Grocery
- Grains (अन्न)
- Pulses (दालें)
- Sweeteners (मिष्ठाने)
- Oils (तेल)
- Beverages (पेयें)
- Breakfast (नाश्ता)
- Spices (मसाले)
- Dry Fruits (सुके मेवे)

### 🥛 Milk & Dairy
- Milk (दूध) and dairy products with volume units (250ml - 1Liter)

## Weight Units

### Indian Weights (भारतीय इकाई)
- 62.5g - आधा चटक (Adha Chatak)
- 125g - एक चटक (1 Chatak)
- 250g - पाव (Pav)
- 375g - डेढ़ पाव (Dedh Pav)
- 500g - आधा किलो (Half Kilo)
- 750g - पौने किलो (Paune Kilo)
- 1000g - एक किलो (1 Kilo)

### Dairy Volumes
- 250ml, 500ml, 750ml, 1 Liter

### Packet Mode
- 1-5 packets with quantity-based pricing

## Usage

1. **Select Category** - Choose from main categories
2. **Select Items** - Add items to your selection
3. **Set Price & Quantity** - Use calculator to set base price
4. **Create List** - Save as a shopping list
5. **View Prices** - See calculated prices for all weight options

## Price Calculations

The app automatically calculates prices for all weight options based on your base price:

**Example:**
- Base: 500g @ ₹30
- Shows: 250g (₹15), 1KG (₹60), etc.
- Bilingual: Prices shown in Hindi & Marathi words

## Development

```bash
# Lint code
bun run lint

# Type check
bun run type-check

# Build for production
bun run build
```

## License

MIT
