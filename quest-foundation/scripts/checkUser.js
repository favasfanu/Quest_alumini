const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const id = process.argv[2]
  if (!id) {
    console.error('Usage: node scripts/checkUser.js <userId>')
    process.exit(2)
  }
  try {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, isLoanEligible: true } })
    if (!user) {
      console.error('User not found:', id)
      process.exit(1)
    }
    console.log(JSON.stringify(user, null, 2))
  } catch (err) {
    console.error('Error querying user:', err)
    process.exit(3)
  } finally {
    await prisma.$disconnect()
  }
}

main()
