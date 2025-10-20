# Grant Tag System

A comprehensive grant management system with tagging capabilities, built with Python Flask backend and React.js frontend, fully containerized with Docker.

## Features

### Backend (Python Flask)
- **RESTful API** with comprehensive CRUD operations
- **SQLite Database** with SQLAlchemy ORM
- **Grant Management**: Create, read, update, delete grants
- **Tag System**: Manage tags with colors and descriptions
- **Many-to-Many Relationships**: Grants can have multiple tags
- **Search & Filter**: Full-text search and tag-based filtering
- **CORS Support**: Cross-origin requests enabled
- **Docker Support**: Fully containerized with multi-stage builds

### Frontend (React.js)
- **Modern UI** with Tailwind CSS
- **Responsive Design** for all screen sizes
- **Grant Cards** with comprehensive information display
- **Tag Management** with color-coded visual tags
- **Search & Filter** functionality
- **Modal Forms** for creating/editing grants
- **Real-time Updates** with API integration
- **Production Ready**: Optimized build with Nginx serving
- **Docker Support**: Multi-stage Docker build for production

## Project Structure

```
grant-tag-system/
├── backend/
│   ├── app.py                 # Flask application
│   ├── run.py                 # Flask runner script
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend Docker configuration
│   └── .dockerignore         # Backend Docker ignore file
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Tailwind CSS styles
│   ├── build/                # Production build output
│   ├── package.json          # Node.js dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── postcss.config.js     # PostCSS configuration
│   ├── nginx.conf            # Nginx configuration for production
│   ├── Dockerfile            # Frontend Docker configuration
│   └── .dockerignore         # Frontend Docker ignore file
├── docker-compose.yml        # Docker Compose configuration
└── README.md
```

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### Docker Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Superstar-IT/grant-tag-system.git
   cd grant-tag-system
   ```

2. **Start the application with Docker Compose:**
   ```bash
   docker compose up --build -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

4. **Stop the application:**
   ```bash
   docker compose down
   ```


## API Endpoints

### Grants
- `GET /api/grants` - Get all grants (with search and filter parameters)
- `GET /api/grants/<id>` - Get specific grant
- `POST /api/grants` - Create new grant
- `PUT /api/grants/<id>` - Update grant
- `DELETE /api/grants/<id>` - Delete grant

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/<id>` - Get specific tag
- `POST /api/tags` - Create new tag
- `PUT /api/tags/<id>` - Update tag
- `DELETE /api/tags/<id>` - Delete tag
- `GET /api/tags/<id>/grants` - Get grants for specific tag

### Health Check
- `GET /api/health` - API health status


## Usage

1. **View Grants**: Browse all grants on the main page
2. **Search**: Use the search bar to find grants by title, description, or organization
3. **Filter by Tags**: Click on tag buttons to filter grants by specific tags
4. **Create Grant**: Click "Add Grant" button to create a new grant
5. **Edit Grant**: Click the edit icon on any grant card
6. **Delete Grant**: Click the delete icon on any grant card
7. **Tag Management**: Tags are automatically managed through the grant creation/editing process