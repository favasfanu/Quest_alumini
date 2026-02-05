import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PASSWORD = bcrypt.hashSync('password123', 10);

async function createUser(type: 'ADMIN' | 'ALUMNI' | 'STAFF' | 'NON_ALUMNI') {
  const email = faker.internet.email().toLowerCase();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: PASSWORD,
      userType:
        type === 'ALUMNI'
          ? 'ALUMNI'
          : type === 'STAFF'
          ? 'STAFF'
          : 'NON_ALUMNI',
      role:
        type === 'ADMIN'
          ? 'ADMIN'
          : type === 'STAFF'
          ? 'QUEST_STAFF'
          : type === 'ALUMNI'
          ? 'ALUMNI_MEMBER'
          : 'NON_ALUMNI_MEMBER',
      status: 'APPROVED',
    },
  });

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      fullName: faker.person.fullName(),
      batchYear: faker.number.int({ min: 2010, max: 2023 }),
      department: faker.helpers.arrayElement([
        'Computer Science',
        'Commerce',
        'Arts',
        'Science',
      ]),
      city: faker.location.city(),
      country: 'India',
    },
  });

  await prisma.profilePrivacySettings.create({
    data: {
      profileId: profile.id,
    },
  });

  if (type !== 'NON_ALUMNI') {
    await prisma.jobExperience.create({
      data: {
        profileId: profile.id,
        companyName: faker.company.name(),
        jobTitle: faker.person.jobTitle(),
        startDate: faker.date.past({ years: 5 }),
      },
    });
  }

  if (type === 'ALUMNI') {
    await prisma.educationRecord.create({
      data: {
        profileId: profile.id,
        institution: 'Quest Institute',
        degree: faker.helpers.arrayElement([
          'BSc',
          'BCom',
          'BA',
          'BCA',
        ]),
        startYear: profile.batchYear! - 3,
        endYear: profile.batchYear!,
      },
    });
  }

  if (type !== 'NON_ALUMNI') {
    await prisma.membershipCard.create({
      data: {
        userId: user.id,
        cardNumber: `QC-${faker.number.int({ min: 100000, max: 999999 })}`,
        qrCodeData: user.id,
      },
    });
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  for (let i = 0; i < 5; i++) await createUser('ADMIN');
  for (let i = 0; i < 60; i++) await createUser('ALUMNI');
  for (let i = 0; i < 20; i++) await createUser('STAFF');
  for (let i = 0; i < 15; i++) await createUser('NON_ALUMNI');

  console.log('✅ 100 users seeded successfully');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
