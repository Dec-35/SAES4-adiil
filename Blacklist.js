class Blacklist {
  constructor() {
    this.blacklist = new Map();

    // Clear the blacklist every hour
    setInterval(() => {
      this.clearBlacklist();
    }, 60 * 60 * 1000);
  }

  // Add IP to the blacklist and increment the count
  addToBlacklist(ip) {
    const count = this.blacklist.get(ip) || 0;
    this.blacklist.set(ip, count + 1);
  }

  // Check if IP is blacklisted
  isBlacklisted(ip) {
    const count = this.blacklist.get(ip) || 0;
    console.log(`(has been blacklisted ${count} times)`);
    return count >= 10;
  }

  // Clear the blacklist
  clearBlacklist() {
    this.blacklist.clear();
  }
}

export default Blacklist;
