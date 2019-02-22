const result = require('dotenv').config();
const { Pool } = require('pg');

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: !process.env.STAGE_SSL && true, //?
};

const pool = new Pool(config);

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

const getUsers = (request, response) => {
  pool.query('SELECT * FROM highscores ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  })
}

const getUsers2 = (req, res) => {
pool.query('SELECT * FROM highscores WHERE id = $1', [1])
  .then(res => console.log('user:', res.rows[0]["score"]))
  .catch(e => setImmediate(() => { throw e }));
}

module.exports = {
    getUsers,
    getUsers2,
    /* getUserById,
    createUser,
    updateUser,
    deleteUser, */
  }
