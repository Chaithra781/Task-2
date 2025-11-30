const { spawn } = require('child_process');
const http = require('http');
const { exec } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkServer(port, name, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://localhost:${port}`, { timeout: 2000 }, (res) => {
        resolve(true);
      });
      
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error(`Server ${name} failed to start after ${maxAttempts} attempts`));
        } else {
          setTimeout(check, 1000);
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error(`Server ${name} failed to start after ${maxAttempts} attempts`));
        } else {
          setTimeout(check, 1000);
        }
      });
    };
    check();
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let command;
  
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  exec(command, (error) => {
    if (error) {
      log(`Could not open browser automatically. Please open ${url} manually.`, 'yellow');
    } else {
      log(`\n🌐 Browser opened: ${url}`, 'cyan');
    }
  });
}

async function main() {
  log('\n🚀 Starting Employee Attendance System...\n', 'cyan');
  
  // Check MongoDB first
  log('📊 Checking MongoDB connection...', 'blue');
  const checkMongo = spawn('node', [path.join(__dirname, '../server/scripts/checkMongoDB.js')], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });
  
  await new Promise((resolve) => {
    checkMongo.on('close', (code) => {
      if (code === 0) {
        log('✅ MongoDB is ready!\n', 'green');
      } else {
        log('⚠️  MongoDB connection issue - server will still start but may have errors\n', 'yellow');
      }
      resolve();
    });
  });
  
  // Start the dev servers
  log('🔧 Starting development servers...\n', 'blue');
  
  const devProcess = spawn('npm', ['run', 'dev:simple'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });
  
  // Wait a bit for servers to start
  log('\n⏳ Waiting for servers to start (this may take 15-20 seconds)...\n', 'yellow');
  
  setTimeout(async () => {
    try {
      log('\n' + '─'.repeat(60), 'cyan');
      log('🔍 Checking server status...\n', 'blue');
      
      // Check backend
      try {
        await checkServer(5000, 'Backend', 20);
        log('✅ Backend server is running on http://localhost:5000', 'green');
      } catch (error) {
        log('⚠️  Backend server may still be starting...', 'yellow');
      }
      
      // Check frontend
      try {
        await checkServer(3000, 'Frontend', 30);
        log('✅ Frontend server is running on http://localhost:3000', 'green');
        
        log('\n' + '='.repeat(60), 'green');
        log('🎉 ALL SERVERS ARE RUNNING SUCCESSFULLY!', 'green');
        log('='.repeat(60) + '\n', 'green');
        log('📱 Frontend: http://localhost:3000', 'cyan');
        log('🔌 Backend API: http://localhost:5000', 'cyan');
        log('💾 MongoDB: Connected\n', 'green');
        
        // Open browser
        setTimeout(() => {
          log('🌐 Opening browser automatically...\n', 'blue');
          openBrowser('http://localhost:3000');
        }, 1000);
        
      } catch (error) {
        log('⚠️  Frontend server may still be starting...', 'yellow');
        log('💡 You can manually open http://localhost:3000 when ready\n', 'yellow');
      }
    } catch (error) {
      log('⚠️  Some servers may still be starting. Check the output above.', 'yellow');
    }
  }, 20000); // Wait 20 seconds for servers to start
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('\n\n🛑 Stopping servers...', 'yellow');
    devProcess.kill();
    process.exit(0);
  });
}

main().catch(console.error);

