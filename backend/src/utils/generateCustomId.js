const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generates a custom ID like PA001 or DR011.
 * @param {'PARENT' | 'DRIVER' | 'ADMIN'} role 
 * @returns {Promise<string>} 
 */
async function generateCustomId(role) {
  let prefix = '';
  if (role === 'PARENT') prefix = 'PA';
  if (role === 'DRIVER') prefix = 'DR';
  if (role === 'ADMIN') prefix = 'AD';

  // Find the user with the highest ID for this role
  // Since IDs are string, we need to sort them carefully, 
  // but for simplicity in this MVP, Prisma orderBy works well enough if length is consistent (e.g. 001-999).
  const lastUser = await prisma.user.findFirst({
    where: { role },
    orderBy: { id: 'desc' }
  });

  if (!lastUser) {
    return `${prefix}001`;
  }

  // Extract the numeric part (e.g., "011" from "DR011")
  const lastNumberStr = lastUser.id.replace(prefix, '');
  const lastNumber = parseInt(lastNumberStr, 10);

  // Increment and pad with zeros
  const nextNumber = lastNumber + 1;
  const nextNumberStr = nextNumber.toString().padStart(3, '0');

  return `${prefix}${nextNumberStr}`;
}

module.exports = { generateCustomId };
