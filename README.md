# Furniture Marketplace

## Project Overview
Furniture Marketplace is a full-stack web application that allows users to buy and sell furniture items. It features a React frontend for a smooth user experience and a Django backend for robust data management and API services. The application utilizes AWS S3 for image storage and CloudFront for efficient content delivery.

## Live Demo
The application is deployed and accessible [here](https://taikoeda.jp/)

## Key Features
- [x] User authentication and authorization
- [x] Listing creation, management, and browsing
- [x] Image upload and management for listings, using AWS S3 and CloudFront
- [x] Search and filter functionality for furniture items
- [x] Responsive design for various devices
- [ ] Update styling
- [ ] Implement real-time messaging between buyers and sellers
- [ ] Add a rating system for users
- [ ] Ability to favorite/unfavorite listings
- [ ] Connect a payment service (Stripe)

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js and npm
- AWS account with S3 and CloudFront access
- Git

### Initial Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/tkoeda/Django-React-Marketplace.git
   cd Django-React-Marketplace
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the root directory and add the following configuration:
   ```env
   VITE_API_URL_LOCAL=http://127.0.0.1:8000 

   # S3 Configuration
   USE_S3=True
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_STORAGE_BUCKET_NAME=your_bucket_name
   AWS_S3_REGION_NAME=your_region
   AWS_S3_FILE_OVERWRITE=False
   AWS_DEFAULT_ACL=False
   DEFAULT_FILE_STORAGE=storages.backends.s3.S3Storage 
   
   # CloudFront Configuration
   CLOUDFRONT_DISTRIBUTION_DOMAIN_NAME=your_cloudfront_domain
   AWS_CLOUDFRONT_KEY_ID=your_key_id
   AWS_CLOUDFRONT_KEY=your_key
   ```

4. For AWS S3 and CloudFront setup, follow the tutorial at: [AWS S3 Setup Tutorial](https://www.youtube.com/watch?v=RsiXzwesNLQ)
   - Create an S3 bucket
   - Configure CORS settings
   - Set up CloudFront distribution
   - Generate necessary access keys
   - Update the `.env` file with your credentials

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack
### Frontend
- React
- SCSS for styling
- Axios for API requests

### Backend
- Django
- Django Rest Framework
- SQLite database
- AWS S3 for image storage
- AWS CloudFront for content delivery

## Project Structure
```
furniture-marketplace/
│
├── backend/
│   ├── core/  # Main Django app
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── utils.py  # S3 and CloudFront integrations
│   │   └── permissions.py  # Custom permissions
│   │
│   ├── listings/  # Listings app
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   │
│   └── users/  # Users app
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       └── urls.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/  
│   │   ├── api.js  
│   │   └── App.js
│   │
│   └── public/
│
└── .env  # Environment variables
```

## Key Components
### Backend
1. **Listings App**
   - `FurnitureListing` model for storing listing information
   - `ListingImage` model for managing multiple images per listing
   - RESTful API endpoints for CRUD operations on listings
   - Custom permissions to ensure only owners can edit their listings

2. **Users App**
   - Custom user model extending Django's built-in User
   - Authentication views for user registration and token generation

3. **S3 and CloudFront Integration**
   - Utility functions for generating pre-signed URLs for secure image access
   - Custom storage backend for handling image uploads to S3
   - CloudFront configuration for efficient content delivery of images

### Frontend
1. **API Integration**
   - Axios instance with request interceptor for attaching authentication tokens
   - Centralized API call handling

2. **Responsive Design**
   - SCSS used for flexible and maintainable styling
   - Mobile-first approach ensuring usability across devices

## Future Enhancements
- Update styling
- Implement real-time messaging between buyers and sellers
- Add a rating system for users
- Integrate a payment gateway for in-app transactions
- Ability to favorite/unfavorite listings
