import Dexie from 'dexie';

export const db = new Dexie('LifeOS_Database');

db.version(1).stores({
  areas: '++id, name, icon, color',
  tasks: '++id, title, status, priority, dueDate, areaId, *tags',
  events: '++id, title, startDate, endDate, areaId, *tags',
  notes: '++id, title, areaId, category, isPinned, *tags, updatedAt'
});

// Seed data if empty
export const seedDatabase = async () => {
  const areaCount = await db.areas.count();
  if (areaCount === 0) {
    const defaultAreas = [
      { name: 'Praca', icon: 'Briefcase', color: '#6366F1' },
      { name: 'Dom', icon: 'Home', color: '#10B981' },
      { name: 'Zdrowie', icon: 'Heart', color: '#EF4444' },
      { name: 'Logistyka', icon: 'Truck', color: '#F59E0B' },
      { name: 'Finanse', icon: 'Wallet', color: '#8B5CF6' },
      { name: 'Edukacja', icon: 'GraduationCap', color: '#06B6D4' },
      { name: 'Rodzina', icon: 'Users', color: '#EC4899' }
    ];
    await db.areas.bulkAdd(defaultAreas);
  }
};
