import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const clearDatabase = async () => {
  try {
    console.log("🚨 DANGER ZONE - DATABASE RESET SCRIPT 🚨");
    console.log("=====================================");
    console.log("This will permanently delete ALL data from your database!");
    console.log("This action cannot be undone!");
    console.log("");

    const confirmation1 = await askQuestion(
      'Are you sure you want to continue? (type "yes" to continue): '
    );

    if (confirmation1.toLowerCase() !== "yes") {
      console.log("❌ Operation cancelled.");
      process.exit(0);
    }

    console.log("");
    console.log("⚠️  FINAL WARNING: This will delete ALL users and data!");
    const confirmation2 = await askQuestion(
      'Type "DELETE ALL DATA" to confirm: '
    );

    if (confirmation2 !== "DELETE ALL DATA") {
      console.log("❌ Operation cancelled.");
      process.exit(0);
    }

    console.log("");
    console.log("🗑️  Starting database cleanup...");

    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);

    // Add more delete operations here for other models as your app grows
    // Example:
    // const deletedPosts = await prisma.post.deleteMany({});
    // console.log(`✅ Deleted ${deletedPosts.count} posts`);

    console.log("");
    console.log("🎉 Database has been completely reset!");
    console.log("✨ You now have a fresh, clean database.");
    console.log("");
    console.log("Next steps:");
    console.log("1. Restart your server if it's running");
    console.log("2. Create new test accounts");
    console.log("3. Test your application");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    console.log("");
    console.log("Common issues:");
    console.log("- Make sure your database is running");
    console.log("- Check your DATABASE_URL in .env file");
    console.log("- Ensure you have proper database permissions");
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
};

const showStats = async () => {
  try {
    console.log("📊 Current Database Statistics");
    console.log("============================");

    const userCount = await prisma.user.count();
    console.log(`👥 Total Users: ${userCount}`);

    const verifiedUsers = await prisma.user.count({
      where: { isVerified: true },
    });
    console.log(`✅ Verified Users: ${verifiedUsers}`);

    const unverifiedUsers = await prisma.user.count({
      where: { isVerified: false },
    });
    console.log(`⏳ Unverified Users: ${unverifiedUsers}`);

    // Show recent users
    if (userCount > 0) {
      console.log("");
      console.log("📋 Recent Users:");
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          isVerified: true,
          createdAt: true,
        },
      });

      recentUsers.forEach((user, index) => {
        const status = user.isVerified ? "✅" : "⏳";
        const date = user.createdAt.toLocaleDateString();
        console.log(
          `${index + 1}. ${status} ${user.firstName} ${user.lastName} (@${
            user.username
          }) - ${user.email} - ${date}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error fetching database stats:", error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
};

const main = async () => {
  console.log("🛠️  Database Management Tool");
  console.log("==========================");
  console.log("");
  console.log("What would you like to do?");
  console.log("1. View database statistics");
  console.log("2. Clear all data (DANGER!)");
  console.log("3. Exit");
  console.log("");

  const choice = await askQuestion("Enter your choice (1-3): ");

  switch (choice) {
    case "1":
      await showStats();
      break;
    case "2":
      await clearDatabase();
      break;
    case "3":
      console.log("👋 Goodbye!");
      rl.close();
      break;
    default:
      console.log("❌ Invalid choice. Please run the script again.");
      rl.close();
  }
};

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n\n👋 Script interrupted. Cleaning up...");
  await prisma.$disconnect();
  rl.close();
  process.exit(0);
});

main().catch(async (error) => {
  console.error("❌ Unexpected error:", error);
  await prisma.$disconnect();
  rl.close();
  process.exit(1);
});
