import { PrismaClient } from '@prisma/client';
import type { Category, BaseUnit } from '@/types/sabjirate';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.listItem.deleteMany();
  await prisma.list.deleteMany();
  await prisma.product.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Seed Vegetables (KILOGRAM base unit)
  const vegetables = [
    { nameEn: 'Onion', nameHi: 'प्याज', nameMr: 'कांदा' },
    { nameEn: 'Potato', nameHi: 'आलू', nameMr: 'बटाटा' },
    { nameEn: 'Tomato', nameHi: 'टमाटर', nameMr: 'टोमॅटो' },
    { nameEn: 'Carrot', nameHi: 'गाजर', nameMr: 'गाजर' },
    { nameEn: 'Cabbage', nameHi: 'पत्ता गोभी', nameMr: 'कोबी' },
    { nameEn: 'Cauliflower', nameHi: 'फूलगोभी', nameMr: 'फुलकोबी' },
    { nameEn: 'Spinach', nameHi: 'पालक', nameMr: 'पालक' },
    { nameEn: 'Okra', nameHi: 'भिंडी', nameMr: 'भेंडी' },
    { nameEn: 'Brinjal', nameHi: 'बैंगन', nameMr: 'वांगे' },
    { nameEn: 'Green Peas', nameHi: 'हरी मटर', nameMr: 'वाटाणे' },
    { nameEn: 'Bitter Gourd', nameHi: 'करेला', nameMr: 'कारले' },
    { nameEn: 'Bottle Gourd', nameHi: 'लौकी', nameMr: 'दुधी' },
  ];

  for (const veg of vegetables) {
    await prisma.product.create({
      data: {
        nameEn: veg.nameEn,
        nameHi: veg.nameHi,
        nameMr: veg.nameMr,
        category: 'VEGETABLES' as Category,
        baseUnit: 'KILOGRAM' as BaseUnit,
      },
    });
  }
  console.log(`✅ Created ${vegetables.length} vegetables`);

  // Seed Fruits (KILOGRAM base unit)
  const fruits = [
    { nameEn: 'Apple', nameHi: 'सेब', nameMr: 'सफरचंद' },
    { nameEn: 'Banana', nameHi: 'केला', nameMr: 'केळी' },
    { nameEn: 'Mango', nameHi: 'आम', nameMr: 'आंबा' },
    { nameEn: 'Orange', nameHi: 'संतरा', nameMr: 'संत्रा' },
    { nameEn: 'Grapes', nameHi: 'अंगूर', nameMr: 'द्राक्षे' },
    { nameEn: 'Watermelon', nameHi: 'तरबूज', nameMr: 'कलिंगड' },
    { nameEn: 'Papaya', nameHi: 'पपीता', nameMr: 'पपई' },
    { nameEn: 'Guava', nameHi: 'अमरूद', nameMr: 'पेरू' },
  ];

  for (const fruit of fruits) {
    await prisma.product.create({
      data: {
        nameEn: fruit.nameEn,
        nameHi: fruit.nameHi,
        nameMr: fruit.nameMr,
        category: 'FRUITS' as Category,
        baseUnit: 'KILOGRAM' as BaseUnit,
      },
    });
  }
  console.log(`✅ Created ${fruits.length} fruits`);

  // Seed Dairy (LITER base unit - STRICT RULE)
  const dairy = [
    { nameEn: 'Milk', nameHi: 'दूध', nameMr: 'दूध' },
    { nameEn: 'Buttermilk', nameHi: 'छाछ', nameMr: 'ताक' },
    { nameEn: 'Curd', nameHi: 'दही', nameMr: 'दही' },
    { nameEn: 'Cream', nameHi: 'मलाई', nameMr: 'सर्व' },
  ];

  for (const item of dairy) {
    await prisma.product.create({
      data: {
        nameEn: item.nameEn,
        nameHi: item.nameHi,
        nameMr: item.nameMr,
        category: 'DAIRY' as Category,
        baseUnit: 'LITER' as BaseUnit,
      },
    });
  }
  console.log(`✅ Created ${dairy.length} dairy items`);

  // Seed Kirana (KILOGRAM base unit)
  const kirana = [
    { nameEn: 'Rice', nameHi: 'चावल', nameMr: 'तांदूळ' },
    { nameEn: 'Wheat Flour', nameHi: 'गेहूं का आटा', nameMr: 'गहू आटा' },
    { nameEn: 'Toor Dal', nameHi: 'अरहर दाल', nameMr: 'तूर डाळ' },
    { nameEn: 'Moong Dal', nameHi: 'मूंग दाल', nameMr: 'मूग डाळ' },
    { nameEn: 'Chana Dal', nameHi: 'चना दाल', nameMr: 'चन्या डाळ' },
    { nameEn: 'Urad Dal', nameHi: 'उड़द दाल', nameMr: 'उडीद डाळ' },
    { nameEn: 'Sugar', nameHi: 'चीनी', nameMr: 'साखर' },
    { nameEn: 'Salt', nameHi: 'नमक', nameMr: 'मीठ' },
    { nameEn: 'Chickpea Flour', nameHi: 'बेसन', nameMr: 'बेसन' },
  ];

  for (const item of kirana) {
    await prisma.product.create({
      data: {
        nameEn: item.nameEn,
        nameHi: item.nameHi,
        nameMr: item.nameMr,
        category: 'KIRANA' as Category,
        baseUnit: 'KILOGRAM' as BaseUnit,
      },
    });
  }
  console.log(`✅ Created ${kirana.length} kirana items`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
