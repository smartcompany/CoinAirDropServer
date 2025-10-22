// Crawler script to be run via cron
const { CrawlerManager } = require('../lib/crawlers');

async function main() {
  console.log('=== Starting Airdrop Crawler ===');
  console.log('Time:', new Date().toISOString());
  
  const manager = new CrawlerManager();
  
  try {
    const result = await manager.runAll();
    
    console.log('\n=== Crawler Results ===');
    console.log(`Total airdrops found: ${result.total}`);
    console.log(`Successfully saved: ${result.saved}`);
    
    if (result.errors.length > 0) {
      console.log('\nErrors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n=== Crawler Complete ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error in crawler:', error);
    process.exit(1);
  }
}

main();

