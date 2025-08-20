# Please Read This First 


# Steps for enable this config setup backend


1. CD this dir. " cd backend
2. Must run "npm install"
3. Check the .env file and change these things
    a. port number
    b. database url (Must create DB first )
    c. creae JWT secret key (If implement user AUTH)
4. Open server.js and update the port number 
5. End of the backend setup


# Notes

1. Create a model first to obtain data from DB inside controller dir
2. Middleware if any require place under midelware.
3. Create a controller for custom instruction for the data.
4. create a route inside index.js
5. re-run the service.