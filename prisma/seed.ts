import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: { name: 'Electronics', slug: 'electronics' }
  })

  // Create sample products
  await prisma.product.createMany({
    data: [
      { title: 'Wireless Headphones', description: 'Comfortable wireless headphones', price: 99.99, image: 'https://via.placeholder.com/400x300?text=Headphones', inventory: 50, categoryId: electronics.id },
      { title: 'Smart Watch', description: 'Track fitness and notifications', price: 149.99, image: 'https://via.placeholder.com/400x300?text=Smart+Watch', inventory: 30, categoryId: electronics.id },
      { title: 'Coffee Maker', description: 'Brew the perfect cup', price: 59.99, image: 'https://via.placeholder.com/400x300?text=Coffee+Maker', inventory: 20 }
    ]
  })

  console.log('Seeded sample data')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
