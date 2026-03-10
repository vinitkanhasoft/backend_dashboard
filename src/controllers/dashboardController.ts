import { Response } from 'express';
import { Car } from '../models/Car';
import { IAuthRequest } from '../types';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';

// Dashboard Search Cars - Optimized for frontend consumption
export const dashboardSearchCars = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      q,
      page = 1,
      limit = 12,
      brand,
      fuelType,
      transmission,
      bodyType,
      minPrice,
      maxPrice,
      maxYear,
      minYear,
      maxKm,
      minKm,
      seats,
      sortBy = 'relevance',
      sortOrder = 'desc',
      registrationCity,
      registrationState,
      sellerType,
      ownership,
      minSeats,
      maxSeats
    } = req.query;

    // Build search filter
    const filter: any = {
      status: 'available'
    };

    // Text search across multiple fields
    if (q) {
      filter.$or = [
        { title: new RegExp(q as string, 'i') },
        { brand: new RegExp(q as string, 'i') },
        { carModel: new RegExp(q as string, 'i') },
        { variant: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') }
      ];
    }

    // Filter by brand
    if (brand) filter.brand = new RegExp(brand as string, 'i');

    // Filter by fuel type
    if (fuelType) filter.fuelType = fuelType;

    // Filter by transmission
    if (transmission) filter.transmission = transmission;

    // Filter by body type
    if (bodyType) filter.bodyType = bodyType;

    // Filter by seller type
    if (sellerType) filter.sellerType = sellerType;

    // Filter by ownership
    if (ownership) {
      const ownershipNum = parseInt(ownership as string);
      if (!isNaN(ownershipNum)) {
        filter.ownership = ownershipNum;
      }
    }

    // Filter by seats range
    if (seats) {
      const seatsNum = parseInt(seats as string);
      if (!isNaN(seatsNum)) {
        filter.seats = seatsNum;
      }
    } else if (minSeats || maxSeats) {
      filter.seats = {};
      if (minSeats) filter.seats.$gte = parseInt(minSeats as string);
      if (maxSeats) filter.seats.$lte = parseInt(maxSeats as string);
    }

    // Filter by location
    if (registrationCity) filter.registrationCity = new RegExp(registrationCity as string, 'i');
    if (registrationState) filter.registrationState = new RegExp(registrationState as string, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = parseInt(minPrice as string);
      if (maxPrice) filter.salePrice.$lte = parseInt(maxPrice as string);
    }

    // Year range filter
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = parseInt(minYear as string);
      if (maxYear) filter.year.$lte = parseInt(maxYear as string);
    }

    // Kilometer range filter
    if (minKm || maxKm) {
      filter.km = {};
      if (minKm) filter.km.$gte = parseInt(minKm as string);
      if (maxKm) filter.km.$lte = parseInt(maxKm as string);
    }

    // Sorting logic
    let sort: any = {};
    if (sortBy === 'relevance') {
      // Relevance sorting: exact matches first, then by creation date
      sort = { 
        createdAt: -1,
        isFeatured: -1
      };
    } else if (sortBy === 'priceLowToHigh') {
      sort = { salePrice: 1 };
    } else if (sortBy === 'priceHighToLow') {
      sort = { salePrice: -1 };
    } else if (sortBy === 'yearNewToOld') {
      sort = { year: -1 };
    } else if (sortBy === 'yearOldToNew') {
      sort = { year: 1 };
    } else if (sortBy === 'kmLowToHigh') {
      sort = { km: 1 };
    } else if (sortBy === 'kmHighToLow') {
      sort = { km: -1 };
    } else {
      // Default sorting
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute search with projection for dashboard
    const [cars, total] = await Promise.all([
      Car.find(filter)
        .select({
          // Basic Information
          title: 1,
          brand: 1,
          carModel: 1,
          year: 1,
          variant: 1,
          bodyType: 1,
          color: 1,
          
          // Pricing
          regularPrice: 1,
          salePrice: 1,
          onRoadPrice: 1,
          emiStartingFrom: 1,
          
          // Technical Specifications
          km: 1,
          fuelType: 1,
          transmission: 1,
          engine: 1,
          mileage: 1,
          seats: 1,
          ownership: 1,
          
          // Location
          registrationCity: 1,
          registrationState: 1,
          
          // Status
          status: 1,
          isFeatured: 1,
          
          // Images
          primaryImage: 1,
          images: 1,
          
          // Timestamps
          createdAt: 1,
          updatedAt: 1,
          
          // Virtual fields
          discountPercentage: 1
        })
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean() // Use lean for better performance
        .exec(),
      Car.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // Transform data for frontend consumption
    const transformedCars = cars.map(car => {
      // Calculate discount percentage manually since virtual fields don't work with lean()
      const discountPercentage = car.regularPrice && car.salePrice 
        ? Math.round(((car.regularPrice - car.salePrice) / car.regularPrice) * 100)
        : 0;

      return {
      // Basic Information
      id: car._id,
      title: car.title,
      brand: car.brand,
      model: car.carModel,
      year: car.year,
      variant: car.variant,
      bodyType: car.bodyType,
      color: car.color,
      
      // Pricing
      price: {
        regular: car.regularPrice,
        sale: car.salePrice,
        onRoad: car.onRoadPrice,
        emiStartingFrom: car.emiStartingFrom,
        discountPercentage: discountPercentage
      },
      
      // Technical Specifications
      specifications: {
        kilometers: car.km,
        fuelType: car.fuelType,
        transmission: car.transmission,
        engine: car.engine,
        mileage: car.mileage,
        seats: car.seats,
        ownership: car.ownership
      },
      
      // Location
      location: {
        city: car.registrationCity,
        state: car.registrationState
      },
      
      // Status
      status: car.status,
      isFeatured: car.isFeatured,
      
      // Images
      images: {
        primary: car.primaryImage,
        gallery: car.images || []
      },
      
      // Metadata
      postedDate: car.createdAt,
      lastUpdated: car.updatedAt
    };
    });

    res.json(createSuccessResponse('Dashboard search results retrieved successfully', {
      cars: transformedCars,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCars: total,
        carsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        query: q,
        brand,
        fuelType,
        transmission,
        bodyType,
        priceRange: { min: minPrice, max: maxPrice },
        yearRange: { min: minYear, max: maxYear },
        kmRange: { min: minKm, max: maxKm },
        seats,
        location: { city: registrationCity, state: registrationState },
        sellerType,
        ownership,
        sortBy,
        sortOrder
      }
    }));

  } catch (error: any) {
    console.error('Dashboard search cars error:', error);
    res.status(500).json(createErrorResponse('Failed to search cars', error.message));
  }
};

// Get car suggestions for autocomplete
export const getCarSuggestions = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      res.json(createSuccessResponse('Car suggestions retrieved successfully', {
        suggestions: []
      }));
      return;
    }

    const suggestions = await Car.find({
      status: 'available',
      $or: [
        { title: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') },
        { carModel: new RegExp(q, 'i') }
      ]
    })
    .select('title brand carModel year')
    .limit(10)
    .lean();

    const transformedSuggestions = suggestions.map(car => ({
      id: car._id,
      title: car.title,
      brand: car.brand,
      model: car.carModel,
      year: car.year,
      displayText: `${car.year} ${car.brand} ${car.carModel} ${car.variant || ''}`.trim()
    }));

    res.json(createSuccessResponse('Car suggestions retrieved successfully', {
      suggestions: transformedSuggestions
    }));

  } catch (error: any) {
    console.error('Get car suggestions error:', error);
    res.status(500).json(createErrorResponse('Failed to get car suggestions', error.message));
  }
};

// Get popular brands and models for filters
export const getPopularFilters = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const [brands, bodyTypes, fuelTypes, transmissions] = await Promise.all([
      // Popular brands with counts
      Car.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Body types with counts
      Car.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$bodyType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Fuel types with counts
      Car.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$fuelType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Transmission types with counts
      Car.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$transmission', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Get price ranges
    const priceStats = await Car.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$salePrice' },
          maxPrice: { $max: '$salePrice' },
          avgPrice: { $avg: '$salePrice' }
        }
      }
    ]);

    // Get year ranges
    const yearStats = await Car.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: null,
          minYear: { $min: '$year' },
          maxYear: { $max: '$year' }
        }
      }
    ]);

    const filters = {
      brands: brands.map(b => ({ name: b._id, count: b.count })),
      bodyTypes: bodyTypes.map(bt => ({ name: bt._id, count: bt.count })),
      fuelTypes: fuelTypes.map(ft => ({ name: ft._id, count: ft.count })),
      transmissions: transmissions.map(t => ({ name: t._id, count: t.count })),
      priceRange: priceStats[0] ? {
        min: priceStats[0].minPrice,
        max: priceStats[0].maxPrice,
        average: Math.round(priceStats[0].avgPrice)
      } : null,
      yearRange: yearStats[0] ? {
        min: yearStats[0].minYear,
        max: yearStats[0].maxYear
      } : null
    };

    res.json(createSuccessResponse('Popular filters retrieved successfully', filters));

  } catch (error: any) {
    console.error('Get popular filters error:', error);
    res.status(500).json(createErrorResponse('Failed to get popular filters', error.message));
  }
};

// Get dashboard statistics with car counts by type
export const getDashboardStats = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    // Use aggregation pipelines for optimal performance
    const [
      totalCarsResult,
      bodyTypeStats,
      fuelTypeStats,
      brandStats,
      priceRangeStats,
      yearStats,
      transmissionStats,
      recentListings,
      featuredCars
    ] = await Promise.all([
      // Total available cars count
      Car.countDocuments({ status: 'available' }),

      // Cars by body type with counts
      Car.aggregate([
        { $match: { status: 'available' } },
        {
          $group: {
            _id: '$bodyType',
            count: { $sum: 1 },
            avgPrice: { $avg: '$salePrice' },
            minPrice: { $min: '$salePrice' },
            maxPrice: { $max: '$salePrice' }
          }
        },
        { $sort: { count: -1 } },
        {
          $project: {
            _id: 0,
            bodyType: '$_id',
            count: 1,
            avgPrice: { $round: ['$avgPrice', 0] },
            minPrice: 1,
            maxPrice: 1,
            percentage: { $multiply: [{ $divide: ['$count', 100] }, 100] } // Will be calculated later
          }
        }
      ]),

      // Cars by fuel type with counts
      Car.aggregate([
        { $match: { status: 'available' } },
        {
          $group: {
            _id: '$fuelType',
            count: { $sum: 1 },
            avgPrice: { $avg: '$salePrice' },
            avgKm: { $avg: '$km' }
          }
        },
        { $sort: { count: -1 } },
        {
          $project: {
            _id: 0,
            fuelType: '$_id',
            count: 1,
            avgPrice: { $round: ['$avgPrice', 0] },
            avgKm: { $round: ['$avgKm', 0] }
          }
        }
      ]),

      // Top brands with counts
      Car.aggregate([
        { $match: { status: 'available' } },
        {
          $group: {
            _id: '$brand',
            count: { $sum: 1 },
            models: { $addToSet: '$carModel' },
            avgPrice: { $avg: '$salePrice' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            brand: '$_id',
            count: 1,
            modelCount: { $size: '$models' },
            avgPrice: { $round: ['$avgPrice', 0] }
          }
        }
      ]),

      // Price range distribution
      Car.aggregate([
        { $match: { status: 'available' } },
        {
          $bucket: {
            groupBy: '$salePrice',
            boundaries: [0, 500000, 1000000, 2000000, 5000000, 10000000, Infinity],
            default: 'Other',
            output: {
              count: { $sum: 1 },
              avgPrice: { $avg: '$salePrice' }
            }
          }
        },
        {
          $project: {
            _id: 0,
            range: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id', 0] }, then: 'Under 5L' },
                  { case: { $eq: ['$_id', 500000] }, then: '5L - 10L' },
                  { case: { $eq: ['$_id', 1000000] }, then: '10L - 20L' },
                  { case: { $eq: ['$_id', 2000000] }, then: '20L - 50L' },
                  { case: { $eq: ['$_id', 5000000] }, then: '50L - 1Cr' },
                  { case: { $eq: ['$_id', 10000000] }, then: 'Above 1Cr' }
                ],
                default: 'Other'
              }
            },
            count: 1,
            avgPrice: { $round: ['$avgPrice', 0] }
          }
        }
      ]),

      // Year distribution
      Car.aggregate([
        { $match: { status: 'available' } },
        {
          $group: {
            _id: '$year',
            count: { $sum: 1 },
            avgPrice: { $avg: '$salePrice' }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            year: '$_id',
            count: 1,
            avgPrice: { $round: ['$avgPrice', 0] }
          }
        }
      ]),

      // Transmission type stats
      Car.aggregate([
        { $match: { status: 'available' } },
        {
          $group: {
            _id: '$transmission',
            count: { $sum: 1 },
            avgPrice: { $avg: '$salePrice' }
          }
        },
        { $sort: { count: -1 } },
        {
          $project: {
            _id: 0,
            transmission: '$_id',
            count: 1,
            avgPrice: { $round: ['$avgPrice', 0] }
          }
        }
      ]),

      // Recent listings (last 7 days)
      Car.aggregate([
        { 
          $match: { 
            status: 'available',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
        { $limit: 7 }
      ]),

      // Featured cars count
      Car.countDocuments({ status: 'available', isFeatured: true })
    ]);

    // Calculate percentages for body types
    const bodyTypesWithPercentage = bodyTypeStats.map(type => ({
      ...type,
      percentage: totalCarsResult > 0 ? Math.round((type.count / totalCarsResult) * 100) : 0
    }));

    // Calculate percentages for fuel types
    const fuelTypesWithPercentage = fuelTypeStats.map(type => ({
      ...type,
      percentage: totalCarsResult > 0 ? Math.round((type.count / totalCarsResult) * 100) : 0
    }));

    // Calculate percentages for transmission types
    const transmissionWithPercentage = transmissionStats.map(type => ({
      ...type,
      percentage: totalCarsResult > 0 ? Math.round((type.count / totalCarsResult) * 100) : 0
    }));

    // Calculate percentages for price ranges
    const priceRangesWithPercentage = priceRangeStats.map(range => ({
      ...range,
      percentage: totalCarsResult > 0 ? Math.round((range.count / totalCarsResult) * 100) : 0
    }));

    // Format recent listings
    const formattedRecentListings = recentListings.map(listing => ({
      date: `${listing._id.year}-${String(listing._id.month).padStart(2, '0')}-${String(listing._id.day).padStart(2, '0')}`,
      count: listing.count
    }));

    const dashboardStats = {
      overview: {
        totalCars: totalCarsResult,
        featuredCars,
        newListingsThisWeek: recentListings.reduce((sum, listing) => sum + listing.count, 0),
        avgCarPrice: bodyTypeStats.length > 0 
          ? Math.round(bodyTypeStats.reduce((sum, type) => sum + type.avgPrice, 0) / bodyTypeStats.length)
          : 0
      },
      carTypes: {
        byBodyType: bodyTypesWithPercentage,
        byFuelType: fuelTypesWithPercentage,
        byTransmission: transmissionWithPercentage,
        byPriceRange: priceRangesWithPercentage,
        byYear: yearStats
      },
      topBrands: brandStats,
      recentActivity: {
        dailyListings: formattedRecentListings.reverse() // Reverse to show oldest first
      },
      insights: {
        mostPopularBodyType: bodyTypesWithPercentage.length > 0 ? bodyTypesWithPercentage[0].bodyType : null,
        mostPopularFuelType: fuelTypesWithPercentage.length > 0 ? fuelTypesWithPercentage[0].fuelType : null,
        mostPopularBrand: brandStats.length > 0 ? brandStats[0].brand : null,
        averageCarAge: yearStats.length > 0 
          ? new Date().getFullYear() - Math.round(yearStats.reduce((sum, year) => sum + year.year * year.count, 0) / totalCarsResult)
          : 0
      }
    };

    res.json(createSuccessResponse('Dashboard statistics retrieved successfully', dashboardStats));

  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json(createErrorResponse('Failed to get dashboard statistics', error.message));
  }
};
