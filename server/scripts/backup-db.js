const { spawn } = require('node:child_process')
const { once } = require('node:events')
const fsPromises = require('node:fs/promises')
const path = require('node:path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const requiredVariables = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
]
const missingVariables = requiredVariables.filter(name => !process.env[name])

if (missingVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno: ${missingVariables.join(', ')}`
  )
}

const safeDatabaseName = process.env.DB_NAME.replace(/[^a-zA-Z0-9_-]/g, '_')
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDirectory = path.resolve(__dirname, '../backups')
const backupPath = path.join(
  backupDirectory,
  `${safeDatabaseName}-${timestamp}.sql`
)
const mysqldumpPath = process.env.MYSQLDUMP_PATH || 'mysqldump'

const createBackup = async () => {
  await fsPromises.mkdir(backupDirectory, { recursive: true })

  const args = [
    `--host=${process.env.DB_HOST}`,
    `--port=${Number(process.env.DB_PORT) || 3306}`,
    `--user=${process.env.DB_USER}`,
    '--default-character-set=utf8mb4',
    '--single-transaction',
    '--quick',
    '--routines',
    '--triggers',
    '--no-tablespaces',
    `--result-file=${backupPath}`,
    process.env.DB_NAME
  ]

  const child = spawn(mysqldumpPath, args, {
    env: {
      ...process.env,
      MYSQL_PWD: process.env.DB_PASSWORD
    },
    shell: false,
    windowsHide: true
  })
  let stderr = ''

  child.stderr.on('data', chunk => {
    stderr += chunk.toString()
  })

  const [exitCode] = await once(child, 'close')

  if (exitCode !== 0) {
    throw new Error(
      stderr.trim() || `mysqldump finalizo con codigo ${exitCode}`
    )
  }

  const stats = await fsPromises.stat(backupPath)

  if (stats.size === 0) {
    throw new Error('El respaldo generado esta vacio')
  }

  console.log(JSON.stringify({
    level: 'info',
    event: 'database_backup_completed',
    path: backupPath,
    bytes: stats.size
  }))
}

createBackup().catch(async error => {
  await fsPromises.rm(backupPath, { force: true })
  console.error(JSON.stringify({
    level: 'error',
    event: 'database_backup_failed',
    message: error.message
  }))
  process.exitCode = 1
})
