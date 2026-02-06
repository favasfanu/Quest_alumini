import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating main admin user...');

  // Create main admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@questfoundation.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      userType: 'ALUMNI',
      role: 'ADMIN',
      status: 'APPROVED',
      isLoanEligible: true,
    },
  });

  // Create admin profile
  const adminProfile = await prisma.profile.create({
    data: {
      userId: adminUser.id,
      fullName: 'Quest Admin',
      alumniId: 'QF-ADMIN-001',
      batchYear: 2020,
      department: 'Administration',
      city: 'Bangalore',
      country: 'India',
      currentlyWorking: true,
    },
  });

  // Create privacy settings
  await prisma.profilePrivacySettings.create({
    data: {
      profileId: adminProfile.id,
      familyDetailsVisible: true,
      educationVisible: true,
      jobHistoryVisible: true,
      currentJobVisible: true,
      contactDetailsVisible: true,
    },
  });

  // Create contact details
  await prisma.contactDetails.create({
    data: {
      profileId: adminProfile.id,
      email: 'admin@questfoundation.com',
      phone: '+91 1234567890',
    },
  });

  // Create membership card
  await prisma.membershipCard.create({
    data: {
      userId: adminUser.id,
      cardNumber: 'QC-ADMIN-001',
      qrCodeData: adminUser.id,
    },
  });

  console.log('✅ Main admin user created successfully');
  console.log('   Email: admin@questfoundation.com');
  console.log('   Password: admin123');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

