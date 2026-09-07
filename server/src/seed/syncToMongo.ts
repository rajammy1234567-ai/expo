import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { inMemoryStore } from '../store/inMemoryStore';
import { Brand } from '../models/Brand';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { Meeting } from '../models/Meeting';
import { DealCommission } from '../models/DealCommission';
import { BrandKnowledgeBase } from '../models/BrandKnowledgeBase';

dotenv.config();

export async function syncAllToMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/viz_digital_expo';
  console.log(`Connecting to MongoDB at: ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB. Syncing all current data...');

    // Clear old data in MongoDB
    await Promise.all([
      Brand.deleteMany({}),
      User.deleteMany({}),
      Lead.deleteMany({}),
      Meeting.deleteMany({}),
      DealCommission.deleteMany({}),
      BrandKnowledgeBase.deleteMany({}),
    ]);

    // Insert current brands
    if (inMemoryStore.brands.length > 0) {
      await Brand.insertMany(inMemoryStore.brands);
      console.log(`✅ Synced ${inMemoryStore.brands.length} Brands to MongoDB.`);
    }

    // Insert current users
    if (inMemoryStore.users.length > 0) {
      await User.insertMany(inMemoryStore.users);
      console.log(`✅ Synced ${inMemoryStore.users.length} Users to MongoDB.`);
    }

    // Insert current knowledge base chunks
    if (inMemoryStore.knowledgeBases.length > 0) {
      await BrandKnowledgeBase.insertMany(inMemoryStore.knowledgeBases);
      console.log(`✅ Synced ${inMemoryStore.knowledgeBases.length} KB chunks to MongoDB.`);
    }

    // Insert current leads
    if (inMemoryStore.leads.length > 0) {
      await Lead.insertMany(inMemoryStore.leads);
      console.log(`✅ Synced ${inMemoryStore.leads.length} Leads to MongoDB.`);
    }

    // Insert current meetings
    if (inMemoryStore.meetings.length > 0) {
      await Meeting.insertMany(inMemoryStore.meetings);
      console.log(`✅ Synced ${inMemoryStore.meetings.length} Meetings to MongoDB.`);
    }

    // Insert current deals
    if (inMemoryStore.deals.length > 0) {
      await DealCommission.insertMany(inMemoryStore.deals);
      console.log(`✅ Synced ${inMemoryStore.deals.length} Closed Deals to MongoDB.`);
    }

    console.log('🎉 MongoDB synchronization completed successfully!');
  } catch (error: any) {
    console.warn('⚠️ MongoDB sync note:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  syncAllToMongoDB();
}
