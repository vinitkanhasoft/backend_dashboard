// Seller types enum (local definition to avoid car dependencies)
enum SellerType {
  DEALER = 'dealer',
  INDIVIDUAL = 'individual'
}

export const mockSellers = [
  {
    _id: "seller_1",
    name: "Premium Auto Dealer",
    phone: "+91 9876543210",
    email: "premium@example.com",
    location: "Ahmedabad, Gujarat",
    type: SellerType.DEALER,
    rating: 4.5,
    reviewsCount: 127,
    isVerified: true,
    businessLicense: "GST123456789",
    gstNumber: "24AAAPL1234C1ZV",
    createdAt: new Date("2023-01-15T10:30:00.000Z"),
    updatedAt: new Date("2024-01-15T10:30:00.000Z")
  },
  {
    _id: "seller_2",
    name: "Rajesh Kumar",
    phone: "+91 9123456789",
    email: "rajesh.kumar@example.com",
    location: "Mumbai, Maharashtra",
    type: SellerType.INDIVIDUAL,
    rating: 4.2,
    reviewsCount: 23,
    isVerified: false,
    createdAt: new Date("2023-06-20T14:20:00.000Z"),
    updatedAt: new Date("2024-02-01T14:20:00.000Z")
  },
  {
    _id: "seller_3",
    name: "City Motors",
    phone: "+91 8899001122",
    email: "info@citymotors.com",
    location: "Delhi, NCR",
    type: SellerType.DEALER,
    rating: 4.8,
    reviewsCount: 256,
    isVerified: true,
    businessLicense: "DL987654321",
    gstNumber: "07AAAPC5678B2ZY",
    createdAt: new Date("2022-11-10T09:15:00.000Z"),
    updatedAt: new Date("2024-01-20T09:15:00.000Z")
  }
];
