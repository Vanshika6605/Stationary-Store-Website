const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { updateOwnerPasswordSchema } = require('../validations/ownerValidation');

// Update Store Owner Password
const updatePassword = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { oldPassword, newPassword } = updateOwnerPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: ownerId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Internal server error while updating password' });
  }
};

// Store Owner Dashboard: List of users who submitted ratings for their store & average rating
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find the store owned by this user
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!store) {
      return res.json({
        hasStore: false,
        message: 'No store assigned to this owner yet.',
        averageRating: 0,
        totalRatings: 0,
        userRatings: []
      });
    }

    const ratingsCount = store.ratings.length;
    const averageRating = ratingsCount > 0
      ? Number((store.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount).toFixed(1))
      : 0;

    const userRatings = store.ratings.map(r => ({
      ratingId: r.id,
      userId: r.user.id,
      userName: r.user.name,
      userEmail: r.user.email,
      rating: r.rating,
      ratedAt: r.createdAt
    }));

    res.json({
      hasStore: true,
      storeId: store.id,
      storeName: store.name,
      storeAddress: store.address,
      storeEmail: store.email,
      averageRating,
      totalRatings: ratingsCount,
      userRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while fetching owner dashboard' });
  }
};

module.exports = {
  updatePassword,
  getOwnerDashboard
};
