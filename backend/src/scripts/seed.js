const { prisma } = require('../config/database');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Seed the database with initial data
 */
async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Check if seeding has already been done
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      logger.info(`Database already has ${existingUsers} users. Skipping seeding.`);
      return {
        success: true,
        message: 'Database already seeded',
        skipped: true
      };
    }

    // Create default portfolio categories (example reference data)
    const defaultCategories = [
      'Web Development',
      'Mobile App',
      'UI/UX Design',
      'Data Science',
      'Machine Learning',
      'DevOps',
      'Blockchain',
      'Game Development',
      'Graphic Design',
      'Other'
    ];

    logger.info('Creating default portfolio categories...');
    
    // Note: Since you don't have a categories table in your schema,
    // this is just an example. You might store this in a JSON field
    // or create a separate categories table later
    
    // Create a demo/test user if in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('Creating demo user for development...');
      
      const demoUser = await prisma.user.create({
        data: {
          googleId: 'demo_google_id_' + Date.now(),
          email: 'demo@einfo.me',
          name: 'Demo User',
          username: 'demo-user',
          profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          profile: {
            create: {
              bio: 'This is a demo user account created during database seeding. Feel free to explore the features!',
              title: 'Full Stack Developer',
              location: 'Demo City, Demo Country',
              website: 'https://demo.einfo.me',
              showLinks: true,
              showExperience: true,
              showPortfolio: true,
              showEducation: true,
              showTitles: true,
            }
          },
          links: {
            create: [
              {
                title: 'GitHub',
                url: 'https://github.com/demo-user',
                iconName: 'Github',
                displayOrder: 0,
                isActive: true
              },
              {
                title: 'LinkedIn',
                url: 'https://linkedin.com/in/demo-user',
                iconName: 'Linkedin',
                displayOrder: 1,
                isActive: true
              },
              {
                title: 'Twitter',
                url: 'https://twitter.com/demo-user',
                iconName: 'Twitter',
                displayOrder: 2,
                isActive: true
              }
            ]
          },
          workExperiences: {
            create: [
              {
                company: 'Demo Tech Company',
                position: 'Senior Full Stack Developer',
                startDate: new Date('2022-01-01'),
                endDate: null, // Current job
                location: 'Remote',
                description: 'Leading development of modern web applications using React, Node.js, and cloud technologies.',
                iconName: 'Building',
                achievements: [
                  'Increased application performance by 40%',
                  'Led a team of 5 developers',
                  'Implemented CI/CD pipelines'
                ],
                displayOrder: 0,
                isActive: true,
                duration: 'Current'
              },
              {
                company: 'Previous Company',
                position: 'Frontend Developer',
                startDate: new Date('2020-06-01'),
                endDate: new Date('2021-12-31'),
                location: 'San Francisco, CA',
                description: 'Developed user interfaces for e-commerce platform serving 1M+ users.',
                iconName: 'Code',
                achievements: [
                  'Reduced page load time by 60%',
                  'Implemented responsive design system',
                  'Mentored junior developers'
                ],
                displayOrder: 1,
                isActive: true,
                duration: '1 year 6 months'
              }
            ]
          },
          education: {
            create: [
              {
                institution: 'Demo University',
                degree: 'Bachelor of Science',
                fieldOfStudy: 'Computer Science',
                startDate: new Date('2016-09-01'),
                endDate: new Date('2020-05-01'),
                location: 'Demo City, Demo State',
                description: 'Focused on software engineering, algorithms, and data structures.',
                educationType: 'degree',
                gpa: '3.8',
                achievements: [
                  'Summa Cum Laude',
                  "Dean's List for 6 semesters",
                  'Computer Science Club President'
                ],
                courses: [
                  'Data Structures and Algorithms',
                  'Software Engineering',
                  'Database Systems',
                  'Web Development',
                  'Machine Learning'
                ],
                iconName: 'GraduationCap',
                displayOrder: 0,
                isActive: true,
                duration: '4 years'
              }
            ]
          },
          portfolioProjects: {
            create: [
              {
                title: 'E-Commerce Platform',
                description: 'Full-stack e-commerce platform built with React, Node.js, and PostgreSQL.',
                category: 'Web Development',
                url: 'https://demo-ecommerce.example.com',
                iconName: 'ShoppingCart',
                displayOrder: 0,
                isActive: true
              },
              {
                title: 'Task Management App',
                description: 'Mobile-first task management application with real-time collaboration.',
                category: 'Mobile App',
                url: 'https://demo-tasks.example.com',
                iconName: 'CheckSquare',
                displayOrder: 1,
                isActive: true
              }
            ]
          }
        }
      });

      logger.info(`Created demo user: ${demoUser.username} (${demoUser.email})`);
    }

    // Create system-wide settings or configurations here if needed
    // For example: default themes, feature flags, etc.

    const result = {
      success: true,
      message: 'Database seeded successfully',
      seeded: {
        users: process.env.NODE_ENV === 'development' ? 1 : 0,
        categories: defaultCategories.length
      }
    };

    logger.info('Database seeding completed successfully', result.seeded);
    return result;

  } catch (error) {
    logger.error('Database seeding failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check if running directly (not imported)
if (require.main === module) {
  seed()
    .then(result => {
      console.log('\n🌱 Database Seeding Result:');
      console.log(`Success: ${result.success}`);
      console.log(`Message: ${result.message}`);
      
      if (result.skipped) {
        console.log('✅ Seeding skipped - database already contains data');
      } else {
        console.log('✅ Seeding completed successfully');
        if (result.seeded) {
          console.log(`  - Users created: ${result.seeded.users}`);
          console.log(`  - Categories available: ${result.seeded.categories}`);
        }
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seed };
