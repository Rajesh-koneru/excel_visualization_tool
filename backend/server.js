const express = require('express');
const app = express();
const cors = require('cors');

// routes 

const db=require('./db_conn')

const RegisterUser=require('./routes/UserRoutes');

app.use(cors());
db();

app.use(express.json())
app.use('/user',RegisterUser);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:5000`);
});
