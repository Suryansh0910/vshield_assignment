const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const mockCandidates = [
  { fullName: "Arjun Sharma", email: "arjun.sharma@example.com", phone: "9876543210", aadhaar: "456789123456", pan: "ABCDE1234F", dob: "1992-05-15", address: "12, MG Road, Bangalore, Karnataka", status: "VERIFIED" },
  { fullName: "Priya Patel", email: "priya.patel@example.com", phone: "9123456789", aadhaar: "789123456789", pan: "FGHIJ5678K", dob: "1995-11-22", address: "45, Ring Road, Surat, Gujarat", status: "PENDING" },
  { fullName: "Rahul Verma", email: "rahul.verma@example.com", phone: "9988776655", aadhaar: "123456789123", pan: "LMNOP9012Q", dob: "1988-03-10", address: "78, IT Park, Hyderabad, Telangana", status: "FAILED" },
  { fullName: "Neha Singh", email: "neha.singh@example.com", phone: "9876501234", aadhaar: "321654987321", pan: "RSTUV3456W", dob: "1994-08-30", address: "90, Sector 15, Noida, UP", status: "VERIFIED" },
  { fullName: "Vikram Malhotra", email: "vikram.mal@example.com", phone: "9012345678", aadhaar: "741852963741", pan: "XYZAB7890C", dob: "1990-12-05", address: "34, Bandra West, Mumbai, MH", status: "VERIFIED" },
  { fullName: "Anjali Gupta", email: "anjali.g@example.com", phone: "9998887776", aadhaar: "852963741852", pan: "CDEFG1234H", dob: "1996-02-18", address: "56, Civil Lines, Pune, MH", status: "PENDING" },
  { fullName: "Siddharth Rao", email: "siddharth.r@example.com", phone: "9776655443", aadhaar: "963852741963", pan: "IJKLM5678N", dob: "1991-07-25", address: "11, Indiranagar, Bangalore, KA", status: "VERIFIED" },
  { fullName: "Kavya Menon", email: "kavya.m@example.com", phone: "9554433221", aadhaar: "159263487159", pan: "OPQRS9012T", dob: "1993-09-12", address: "22, Kaloor, Kochi, Kerala", status: "FAILED" },
  { fullName: "Aditya Desai", email: "aditya.d@example.com", phone: "9443322110", aadhaar: "357159263487", pan: "UVWXY3456Z", dob: "1989-04-08", address: "88, SG Highway, Ahmedabad, GJ", status: "PENDING" },
  { fullName: "Meera Reddy", email: "meera.r@example.com", phone: "9332211009", aadhaar: "753951456852", pan: "ZABCD7890E", dob: "1997-01-20", address: "44, Jubilee Hills, Hyderabad, TS", status: "VERIFIED" },
  { fullName: "Rohan Kapoor", email: "rohan.k@example.com", phone: "9221100998", aadhaar: "852456951753", pan: "EFGHI1234J", dob: "1994-06-14", address: "77, GK II, New Delhi, DL", status: "VERIFIED" },
  { fullName: "Isha Joshi", email: "isha.j@example.com", phone: "9110099887", aadhaar: "951753852456", pan: "KLMNO5678P", dob: "1995-10-31", address: "33, Viman Nagar, Pune, MH", status: "PENDING" }
];

async function seed() {
  console.log("🌱 Starting Database Seeding...");

  
  let user = await prisma.user.findUnique({ where: { email: 'admin@vshield.com' } });
  
  if (!user) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@vshield.com',
        passwordHash,
        verified: true,
      }
    });
    console.log(`👤 Created Admin User: admin@vshield.com / admin123`);
  } else {
    console.log(`👤 Admin User already exists.`);
  }

  
  await prisma.candidate.deleteMany({});
  console.log(`🗑️ Cleared existing candidates...`);

  
  console.log(`Injecting ${mockCandidates.length} mock candidates...`);
  
  for (const cand of mockCandidates) {
    const candidate = await prisma.candidate.create({
      data: {
        fullName: cand.fullName,
        email: cand.email,
        phone: cand.phone,
        aadhaarNumber: cand.aadhaar,
        panNumber: cand.pan,
        dob: new Date(cand.dob),
        address: cand.address,
        status: cand.status,
        createdById: user.id
      }
    });

    
    if (cand.status !== 'PENDING') {
      await prisma.verificationLog.create({
        data: {
          candidateId: candidate.id,
          verificationType: 'AADHAAR',
          requestPayload: { aadhaarNumber: cand.aadhaar },
          responsePayload: { status: cand.status, source: "mock_aadhaar_api", verifiedAt: new Date().toISOString() },
          verificationStatus: cand.status
        }
      });

      await prisma.verificationLog.create({
        data: {
          candidateId: candidate.id,
          verificationType: 'PAN',
          requestPayload: { panNumber: cand.pan },
          responsePayload: { status: cand.status, nameMatch: true, source: "mock_pan_api" },
          verificationStatus: cand.status
        }
      });
    }
  }

  console.log(`✅ Successfully injected all mock data!`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
