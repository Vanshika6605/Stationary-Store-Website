const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const { addUserSchema, addStoreSchema } = require('../validations/adminValidation');

// Dashboard Stats: Total users, total stores, total ratings
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while fetching dashboard stats' });
  }
};

// Add new user (ADMIN action)
const addUser = async (req, res) => {
  try {
    const validatedData = addUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        address: validatedData.address,
        role: validatedData.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Internal server error while adding user' });
  }
};

// List all users with filtering, sorting, and store rating for Store Owners
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'id', sortOrder = 'asc' } = req.query;

    const where = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };
    if (role) where.role = role;

    const allowedSortFields = ['id', 'name', 'email', 'address', 'role', 'createdAt'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [orderField]: orderDirection },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true }
            }
          }
        }
      }
    });

    // Format response to include store rating for Store Owners
    const formattedUsers = users.map(user => {
      let storeRating = null;
      let storeDetails = null;

      if (user.role === 'STORE_OWNER' && user.stores.length > 0) {
        // Compute rating for owner's store(s)
        const store = user.stores[0];
        const ratings = store.ratings;
        const avgRating = ratings.length > 0
          ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
          : 0;

        storeRating = avgRating;
        storeDetails = {
          id: store.id,
          name: store.name,
          rating: avgRating
        };
      }

      const { stores, ...restUser } = user;
      return {
        ...restUser,
        storeRating,
        storeDetails
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while fetching users' });
  }
};

// Add new store
const addStore = async (req, res) => {
  try {
    const validatedData = addStoreSchema.parse(req.body);

    const existingStore = await prisma.store.findUnique({
      where: { email: validatedData.email }
    });
    if (existingStore) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    if (validatedData.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: validatedData.ownerId }
      });
      if (!owner) {
        return res.status(400).json({ error: 'Specified owner user does not exist' });
      }
    }

    const newStore = await prisma.store.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        address: validatedData.address,
        ownerId: validatedData.ownerId || null
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({ message: 'Store added successfully', store: newStore });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Internal server error while adding store' });
  }
};

// List all stores with details (Name, Email, Address, Overall Rating), filters, and sorting
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'id', sortOrder = 'asc' } = req.query;

    const where = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };

    const allowedSortFields = ['id', 'name', 'email', 'address', 'createdAt'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const stores = await prisma.store.findMany({
      where,
      orderBy: { [orderField]: orderDirection },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        ratings: {
          select: { rating: true }
        }
      }
    });

    let formattedStores = stores.map(store => {
      const ratingsCount = store.ratings.length;
      const averageRating = ratingsCount > 0
        ? Number((store.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingsCount).toFixed(1))
        : 0;

      const { ratings, ...restStore } = store;
      return {
        ...restStore,
        overallRating: averageRating,
        totalRatings: ratingsCount
      };
    });

    // Handle sorting by rating if requested
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

module.exports = {
  getDashboardStats,
  addUser,
  getUsers,
  addStore,
  getStores
};
