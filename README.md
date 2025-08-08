# News Blog

A Node.js + Express.js web application with an SQLite database that allows authors to create, edit, publish, and delete articles, while readers can browse and comment.  
This project was built for the **Databases, Networks and the Web** module.

## Technologies Used
- **Backend:** Node.js, Express.js
- **Templating Engine:** EJS (Embedded JavaScript)
- **Database:** SQLite3
- **Middleware:**
  - body-parser
  - express-session

 ## Features
- Author registration, login, and settings management
- Create, edit, publish, and delete articles
- Reader view for browsing articles
- View single articles with comments section
- SQLite database for storing users, articles, and comments
- EJS templates for rendering dynamic pages

## Setup Instructions
### 1. Clone the repository
```bash
git clone https://github.com/ellenfaustine/News-Blog.git
cd News-Blog```

### 2. Install dependencies
npm install

### 3. Create the database
If using Command Prompt or Bash:
sqlite3 database.db < db_schema.sql
If using PowerShell:
Get-Content db_schema.sql | sqlite3 database.db

### 4. Start the server
node index.js

### 5. Open in browser
http://localhost:3000

## License
This project was developed for academic purposes.
