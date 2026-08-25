const bcrypt = require('bcryptjs');
const prisma = require('../src/prisma');

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('AdminPass@123', 10);
  const ownerPassword = await bcrypt.hash('OwnerPass@123', 10);
  const userPassword = await bcrypt.hash('UserPass@123', 10);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storerating.com' },
    update: {},
    create: {
      name: 'System Administrator One',
      email: 'admin@storerating.com',
      password: hashedPassword,
      address: '100 Admin Boulevard, Capital City',
      role: 'ADMIN'
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Store Owner User
  const owner = await prisma.user.upsert({
    where: { email: 'owner@storerating.com' },
    update: {},
    create: {
      name: 'Alexander Store Owner Person',
      email: 'owner@storerating.com',
      password: ownerPassword,
      address: '200 Retail Parkway, Commerce City',
      role: 'STORE_OWNER'
    }
  });
  console.log('✅ Store Owner user created:', owner.email);

  // 3. Create Normal User
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@storerating.com' },
    update: {},
    create: {
      name: 'Christopher Alexander Montgomery',
      email: 'user@storerating.com',
      password: userPassword,
      address: '300 Normal Residence Way, Suburbia',
      role: 'NORMAL'
    }
  });
  console.log('✅ Normal user created:', normalUser.email);

  // 4. Create Sample Store
  const store = await prisma.store.upsert({
    where: { email: 'contact@techmart.com' },
    update: {},
    create: {
      name: 'TechMart Electronics Store',
      email: 'contact@techmart.com',
      address: '456 Innovation Drive, Tech City',
      ownerId: owner.id
    }
  });
  console.log('✅ Sample Store created:', store.name);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
