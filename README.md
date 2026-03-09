# AuthForge - Modern Authentication System

A futuristic authentication system built with **Angular 18** and **Node.js**, featuring a cyberpunk-inspired UI with secure JWT-based authentication.

![Login Page](https://images.unsplash.com/photo-1771599940657-f9f151abed45?w=800)

## Features

- 🔐 **Secure Authentication** - JWT tokens with bcrypt password hashing
- 📝 **User Registration** - Email validation, password confirmation
- 🔑 **Login with Remember Me** - Extended sessions (30 days)
- 🔄 **Password Reset Flow** - Token-based forgot/reset password
- 🌐 **Google OAuth** - Social login via Emergent Auth
- 🎨 **Futuristic UI** - Cyberpunk dark theme with neon accents
- 📱 **Responsive Design** - Works on all devices

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 18, Tailwind CSS, TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JWT, bcrypt, Google OAuth |

## Project Structure

```
├── angular-frontend/          # Angular 18 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Services, guards
│   │   │   ├── features/      # Auth, Dashboard modules
│   │   │   └── shared/        # Reusable components
│   │   ├── environments/      # Environment configs
│   │   └── styles.scss        # Global styles
│   ├── angular.json
│   └── package.json
│
├── node-backend/              # Node.js Express API
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   └── Session.js
│   ├── routes/
│   │   └── auth.js            # Authentication routes
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── server.js              # Express app entry
│   └── package.json
│
└── README.md
```

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22.x
- **MongoDB** >= 6.x
- **Angular CLI** >= 18.x

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd authforge
```

### 2. Setup Backend

```bash
# Navigate to backend directory
cd node-backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=authforge_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=8001
CORS_ORIGINS=http://localhost:3000
EOF

# Start MongoDB (if not running)
# On macOS: brew services start mongodb-community
# On Ubuntu: sudo systemctl start mongod

# Start the backend server
npm start
```

### 3. Setup Frontend

```bash
# Navigate to frontend directory
cd angular-frontend

# Install dependencies
npm install

# Install Angular CLI globally (if not installed)
npm install -g @angular/cli@18

# Update environment file
# Edit src/environments/environment.ts
# Set apiUrl to your backend URL

# Start the development server
ng serve --host 0.0.0.0 --port 3000
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `authforge_db` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `8001` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `*` |

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8001/api'
};
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Logout and clear session |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/google/session` | Google OAuth callback |

---

# AWS Deployment Guide

## Option 1: EC2 Deployment (Traditional)

### Step 1: Launch EC2 Instance

1. **Login to AWS Console** → EC2 → Launch Instance
2. **Choose AMI**: Ubuntu Server 22.04 LTS
3. **Instance Type**: t3.small (minimum) or t3.medium (recommended)
4. **Configure Security Group**:
   - SSH (22) - Your IP
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (8001) - Anywhere (or VPC only)

5. **Create/Select Key Pair** and download `.pem` file

### Step 2: Connect to EC2

```bash
# Set permissions for key file
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Angular CLI
sudo npm install -g @angular/cli@18
```

### Step 4: Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/authforge
sudo chown -R ubuntu:ubuntu /var/www/authforge
cd /var/www/authforge

# Clone your repository
git clone <your-repo-url> .

# Setup Backend
cd node-backend
npm install

# Create production .env
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=authforge_production
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
PORT=8001
CORS_ORIGINS=https://yourdomain.com
NODE_ENV=production
EOF

# Start backend with PM2
pm2 start server.js --name "authforge-backend"
pm2 save
pm2 startup

# Setup Frontend
cd ../angular-frontend
npm install

# Update production environment
cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: 'https://yourdomain.com/api'
};
EOF

# Build for production
ng build --configuration=production

# Copy build to nginx directory
sudo cp -r dist/angular-frontend/browser/* /var/www/html/
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/authforge
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (after certbot setup)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/html;
    index index.html;

    # Frontend - Angular SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/authforge /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
sudo certbot renew --dry-run
```

---

## Option 2: Docker + AWS ECS Deployment

### Step 1: Create Dockerfiles

**Backend Dockerfile** (`node-backend/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8001

CMD ["node", "server.js"]
```

**Frontend Dockerfile** (`angular-frontend/Dockerfile`):

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist/angular-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf** (`angular-frontend/nginx.conf`):

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 2: Docker Compose (for local testing)

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    networks:
      - authforge-network

  backend:
    build: ./node-backend
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=authforge_db
      - JWT_SECRET=${JWT_SECRET}
      - PORT=8001
    depends_on:
      - mongodb
    networks:
      - authforge-network

  frontend:
    build: ./angular-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - authforge-network

volumes:
  mongodb_data:

networks:
  authforge-network:
```

### Step 3: Push to Amazon ECR

```bash
# Configure AWS CLI
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name authforge-backend
aws ecr create-repository --repository-name authforge-frontend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push images
docker build -t authforge-backend ./node-backend
docker tag authforge-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/authforge-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/authforge-backend:latest

docker build -t authforge-frontend ./angular-frontend
docker tag authforge-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/authforge-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/authforge-frontend:latest
```

### Step 4: Deploy to ECS

1. **Create ECS Cluster** in AWS Console
2. **Create Task Definitions** for backend and frontend
3. **Create Services** with Application Load Balancer
4. **Use Amazon DocumentDB** or MongoDB Atlas for database

---

## Option 3: AWS Amplify (Simplest for Frontend)

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize in frontend directory
cd angular-frontend
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

---

## Production Checklist

- [ ] Set strong `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Enable MongoDB backups
- [ ] Configure CloudWatch logs
- [ ] Set up health checks
- [ ] Configure auto-scaling (if using ECS)
- [ ] Set up CI/CD pipeline (GitHub Actions/AWS CodePipeline)

## Monitoring & Logs

```bash
# View backend logs
pm2 logs authforge-backend

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check if mongod is running: `sudo systemctl status mongod` |
| CORS errors | Verify `CORS_ORIGINS` in backend .env matches frontend URL |
| 502 Bad Gateway | Check if backend is running: `pm2 status` |
| SSL certificate issues | Renew with: `sudo certbot renew` |

## License

MIT License - Feel free to use for personal and commercial projects.

## Support

For issues and feature requests, please open a GitHub issue.
