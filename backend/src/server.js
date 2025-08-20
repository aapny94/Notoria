import app from './app.js';

const port = process.env.PORT || 1003; // change port number //

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



// No need to touch anything else //
// pre config setup //

// to run backend open terminal cd "backend" run " node src/server.js"//