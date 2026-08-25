const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { updatePasswordSchema, submitRatingSchema } = require('../validations/userValidation');

// Update User Password
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
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
      where: { id: userId },
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

// List stores with search by Name/Address, sorting, overall rating, and user's submitted rating
const getStores = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, search, sortBy = 'id', sortOrder = 'asc' } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    } else {
      if (name) where.name = { contains: name, mode: 'insensitive' };
      if (address) where.address = { contains: address, mode: 'insensitive' };
    }

    const allowedSortFields = ['id', 'name', 'address', 'createdAt'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const stores = await prisma.store.findMany({
      where,
      orderBy: { [orderField]: orderDirection },
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true
          }
        }
      }
    });

    let formattedStores = stores.map(store => {
      const ratingsCount = store.ratings.length;
      const overallRating = ratingsCount > 0
        ? Number((store.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount).toFixed(1))
        : 0;

      // Find current user's rating for this store if any
      const userRatingObj = store.ratings.find(r => r.userId === userId);
      const userRating = userRatingObj ? userRatingObj.rating : null;

      const { ratings, ...restStore } = store;
      return {
        ...restStore,
        overallRating,
        totalRatings: ratingsCount,
        userRating
      };
    });

    // Custom sorting by overall rating or user rating if requested
    if (sortBy === 'rating' || sortBy === 'overallRating') {
      formattedStores.sort((a, b) => {
        return orderDirection === 'desc'
          ? b.overallRating - a.overallRating
          : a.overallRating - b.overallRating;
      });
    }

    res.json(formattedStores);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while fetching stores' });
  }
};

// Submit or modify a rating for a store (1 to 5)
const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = submitRatingSchema.parse(req.body);

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Upsert rating (create or update)
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId
        }
      },
      update: { rating },
      create: {
        userId,
        storeId,
        rating
      }
    });

    // Recalculate overall store rating
    const allRatings = await prisma.rating.findMany({
      where: { storeId },
      select: { rating: true }
    });

    const totalRatings = allRatings.length;
    const overallRating = totalRatings > 0
      ? Number((allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1))
      : 0;

    res.json({
      message: 'Rating submitted successfully',
      rating: savedRating.rating,
      storeId,
      overallRating,
      totalRatings
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Internal server error while submitting rating' });
  }
};

module.exports = {
  updatePassword,
  getStores,
  submitRating
};
