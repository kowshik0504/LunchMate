const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateCustomId } = require('../utils/generateCustomId');

exports.registerTestUser = async (req, res) => {
    try {
        const { name, phone, role } = req.body; 

        // 1. Automatically generate the PA001 or DR001 ID
        const customId = await generateCustomId(role);

        // 2. Save the user into the PostgreSQL database
        const newUser = await prisma.user.create({
            data: {
                id: customId,
                name: name,
                phone: phone,
                role: role.toUpperCase() // e.g., 'PARENT' or 'DRIVER'
            }
        });

        // 3. Send the created user back to the frontend
        res.status(201).json({
            message: "Success! User saved to PostgreSQL.",
            user: newUser
        });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Failed to create user in database." });
    }
};